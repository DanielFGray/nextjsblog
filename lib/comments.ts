import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import type { UserCredentials, Session } from '@supabase/supabase-js'

const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNscmVkdndpb21tbmx0dHhhZWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTEwNzgzNjYsImV4cCI6MTk2NjY1NDM2Nn0.hrXY1p-Ysa5q3lPxoUwtKfnXDLZMyx1rreUYtFoBiU0'
const SUPABASE_URL = 'https://slredvwiommnlttxaegc.supabase.co'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function useAuth(): Session | null {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    setSession(supabase.auth.session())

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      listener?.unsubscribe()
    }
  }, [])
  return session
}

export function useSignUp() {
  return useMutation(
    'signup',
    async ({ redirectTo, ...creds }: UserCredentials & { redirectTo?: string }) => {
      const { session, user, error } = await supabase.auth.signUp(creds, { redirectTo })
      if (error) throw error
      return { user, session }
    },
  )
}

export function useSignIn() {
  return useMutation(
    'signin',
    async ({
      scopes,
      captchaToken,
      shouldCreateUser,
      redirectTo,
      ...creds
    }: UserCredentials & {
      redirectTo?: string
      shouldCreateUser?: boolean
      scopes?: string
      captchaToken?: string
    }) => {
      const { session, user, error } = await supabase.auth.signIn(creds, {
        scopes,
        captchaToken,
        shouldCreateUser,
        redirectTo,
      })
      if (error) throw error
      return { user, session }
    },
  )
}

export function useCommentStats() {
  return useQuery(
    'stats',
    async () => {
      const { data, error } = await supabase.rpc<Record<string, `${number}`>>('comments_stats')
      if (error) throw error
      return data as unknown as Record<string, `${number}`>
    },
    {
      refetchOnMount: true,
      staleTime: 10000,
    },
  )
}

export type Comment = Readonly<{
  comment_id: number
  user: {
    username: string
    avatar_url: string | undefined | null
  }
  body: string
  created_at: string
  children: ReadonlyArray<Comment>
}>

export function useCommentFetcher({ slug }: { slug: string }) {
  const queryClient = useQueryClient()
  useEffect(() => {
    const subscription = supabase
      .from(`comments:slug=eq.${slug}`)
      .on('*', _payload => {
        queryClient.invalidateQueries(['comments', slug])
        queryClient.invalidateQueries('stats')
      })
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [slug, queryClient])
  return useQuery(['comments', slug], async () => {
    const { data, error } = await supabase.rpc<Comment>('threaded_comments', { slug })
    if (error) throw error
    return data
  })
}

export function useCreateComment() {
  return useMutation(
    'new_comment',
    async (values: { slug: string; body: string; parent_id: number | null }) => {
      const { data, error } = await supabase.from('comments').insert(values)
      if (error) throw error
      return data
    },
  )
}

export function useLogout() {
  return useMutation('logout', async () => {
    await supabase.auth.signOut()
  })
}

export function useDeleteComment() {
  const queryClient = useQueryClient()
  return useMutation(
    'delete_comment',
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
