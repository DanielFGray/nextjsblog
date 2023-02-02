import { useEffect, useState, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient, type Session, type SignInWithOAuthCredentials } from '@supabase/supabase-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export interface Comment {
  comment_id: number
  user: {
    username: string
    avatar_url: string
    user_id: string
  }
  body: string
  created_at: string
  children: ReadonlyArray<Comment>
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

export function useAuth(): Session | null {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    try {
      ;(async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
      })()
    } catch (e) {
      console.error('error fetching session:', e)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return session
}

export function useSignIn() {
  return useMutation(
    ['sign_in'],
    async function signIn({
      provider,
      options: { redirectTo, ...options },
    }: SignInWithOAuthCredentials) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          ...options,
          redirectTo: (process.env.NEXT_PUBLIC_URL ?? '').concat(redirectTo ?? '/'),
        },
      })
      if (error) throw error
      return data
    },
  )
}

export function useCommentStats() {
  return useQuery(
    ['stats'],
    async () => {
      const { data, error } = await supabase.rpc('comments_stats')
      if (error) throw error
      return data as unknown as Record<string, `${number}`>
    },
    {
      refetchOnMount: true,
      staleTime: 60000,
    },
  )
}

export function useCommentFetcher({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  useEffect(() => {
    const subscription = supabase
      .channel('any')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        queryClient.invalidateQueries(['comments', slug])
        queryClient.invalidateQueries(['recent_comments'])
        queryClient.invalidateQueries(['stats'])
      })
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [slug, queryClient])
  return useQuery(['comments', slug], async () => {
    const { data, error } = await supabase.rpc('threaded_comments', { slug })
    if (error) throw error
    return data
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  return useMutation(
    ['new_comment'],
    async (values: { slug: string; body: string; parent_id: number | null }) => {
      const { data, error } = await supabase.from('comments').insert(values)
      if (error) throw error
      return data
    },
    {
      async onMutate(variables) {
        const prevState = queryClient.getQueryData<Comment[]>(['comments', variables.slug])
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) throw new Error('not logged in!')
        const user = {
          user_id: session.user.id,
          avatar_url: session.user.user_metadata.avatar_url,
          username: session.user.user_metadata.preferred_username,
          date: new Date(),
        }
        const newState: Comment = {
          comment_id: -1,
          body: variables.body,
          user,
          children: [],
          created_at: new Date().toUTCString(),
        }
        queryClient.setQueryData<Comment[]>(['comments', variables.slug], old =>
          [newState].concat(old ? old : []),
        )
        return { prevState }
      },
      onError(err, newState, context) {
        console.error(err)
        queryClient.setQueryData(['comments', newState.slug], context?.prevState)
      },
    },
  )
}

export function useLogout() {
  return useMutation(['logout'], async () => {
    await supabase.auth.signOut()
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation(
    ['delete_comment'],
    async (comment_id: number) => {
      const { data, error } = await supabase.from('comments').delete().eq('comment_id', comment_id)
      if (error) throw error
      return data
    },
    {
      onSuccess() {
        queryClient.invalidateQueries()
      },
    },
  )
}

export function useRecentComments() {
  return useQuery(
    ['recent_comments'],
    async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('comment_id,body,slug,created_at,user_id,profiles!profiles(username,avatar_url)')
        .filter('user_id', 'neq', 'b625603f-e958-4c3a-9eb9-3ceb3601cbd9')
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error
      return data
    },
    {
      refetchOnMount: true,
      staleTime: 10000,
    },
  )
}

type Likes = { total: number; available: number }

export function useGetLikes(post: string) {
  return useQuery(
    ['get_likes', post],
    async () => {
      const { data, error } = await supabase.rpc('get_likes', { post })
      if (error) throw error
      return data as unknown as Likes
    },
    {
      refetchOnMount: true,
      staleTime: 10000,
      refetchInterval: 10000,
    },
  )
}

export function useSendLike(post: string) {
  const queryClient = useQueryClient()
  return useMutation(
    ['like_post', post],
    async (clicks?: number) => {
      const { data, error } = await supabase.rpc('like_post', {
        post,
        requested_votes: clicks,
      })
      if (error) throw error
      return data as unknown as Likes
    },
    {
      onSuccess(data) {
        queryClient.setQueryData<Likes>(['get_likes', post], data)
      },
    },
  )
}

export function QueryProvider({ children }) {
  const client = useRef(
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 0,
          refetchOnMount: false,
          refetchOnWindowFocus: true,
          staleTime: Infinity,
        },
      },
    }),
  )
  return <QueryClientProvider client={client.current}>{children}</QueryClientProvider>
}
