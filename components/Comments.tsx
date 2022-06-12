import { useState, useRef, useCallback } from 'react'
import ago from 's-ago'
import { useRouter } from 'next/router'
import { useSignIn, useAuth, useCreateComment, useLogout, useDeleteComment } from '~/lib/comments'
import type { Comment } from '~/lib/comments'
import { TrashIcon, ReplyIcon } from '@heroicons/react/solid'
import { Session } from '@supabase/supabase-js'
import { clsx } from '~/lib/classNames'

const providers = [
  // { provider: 'twitter', label: 'Twitter' },
  { provider: 'github', label: 'GitHub' },
] as const

export function Comments({ comments }: { comments: undefined | Comment[] }) {
  const [replyId, setReplyId] = useState<null | number>(null)
  const { slug } = useRouter().query
  const formref = useRef<HTMLFormElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const session = useAuth()
  const deleteComment = useDeleteComment()
  const newcomment = useCreateComment()
  const logout = useLogout()
  const signin = useSignIn()

  const setReplyWithFocus = useCallback(id => {
    inputRef.current?.focus()
    setReplyId(id)
  }, [])

  const deleteCommentWithPrompt = useCallback(id => {
    if (confirm('Are you sure you want to delete your comment?')) {
      deleteComment.mutate(id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    try {
      const formData = new FormData(ev.currentTarget)
      const values = Object.fromEntries(formData.entries())
      if (typeof values.comment !== 'string' || typeof slug !== 'string') return
      newcomment.mutate(
        {
          slug,
          body: values.comment.trim().replace(/\n\n+/, '\n\n'),
          parent_id: replyId,
        },
        {
          onSuccess() {
            formref.current?.reset()
          },
        },
      )
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-2 bg-gray-50 p-4 text-gray-900 shadow-lg dark:bg-gray-800 dark:text-gray-200 md:rounded lg:max-w-5xl lg:rounded-xl">
      <h2 id="comment-section" className="text-center text-xl font-bold">
        Comments
      </h2>
      {(() => {
        if (! session) {
          return (
            <div className="flex flex-row justify-center gap-2">
              {providers.map(({ provider }) => (
                <button
                  key={provider}
                  className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  onClick={() => signin.mutate({ provider, redirectTo: `/blog/${slug}` })}
                >
                  sign in with {provider}
                </button>
              ))}
            </div>
          )
        }

        return (
          <form ref={formref} onReset={() => setReplyId(null)} onSubmit={handleSubmit}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Avatar avatar_url={session.user?.user_metadata.avatar_url} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="border-b border-gray-200 focus-within:border-brand-600 dark:border-gray-700">
                  <label htmlFor="comment" className="text-xs font-light text-gray-500">
                    {replyId ? `responding to #${replyId}:` : 'add your comment:'}
                  </label>
                  <textarea
                    rows={3}
                    ref={inputRef}
                    name="comment"
                    id="comment"
                    className="block w-full resize-none border-0 border-b border-transparent bg-transparent p-0 pb-2 focus:border-brand-600 focus:ring-0 dark:text-gray-100 sm:text-sm"
                    placeholder="Say something nice!"
                    defaultValue={''}
                  />
                </div>
                <div className="flex justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flow-root">
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={newcomment.isLoading}
                      >
                        {newcomment.isLoading ? 'sending...' : 'post'}
                      </button>
                    </div>
                    <div className="flow-root">
                      <button
                        type="reset"
                        onClick={() => formref.current?.reset()}
                        className="inline-flex items-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:text-white dark:outline-gray-700 dark:hover:bg-gray-700"
                      >
                        cancel
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      type="reset"
                      onClick={() => {
                        if (confirm('Are you sure you want to log out?')) {
                          logout.mutate()
                        }
                      }}
                      className="ml-auto inline-flex items-center rounded-md border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:text-white dark:outline-gray-700 dark:outline-gray-700"
                    >
                      log out
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {replyId && <input type="hidden" name="parent_id" value={replyId} />}
          </form>
        )
      })()}
      <ul className="-m-1">
        {(() => {
          if (comments === undefined) {
            return <li className="italic">Loading...</li>
          }
          if (! (comments instanceof Array)) {
            console.log('comments are not an array: ', comments)
            return <li className="italic">There was an error fetching comments</li>
          }
          if (comments.length === 0) {
            return <li className="italic">No comments yet</li>
          }
          return comments.map(c => (
            <CommentCard
              key={c.comment_id}
              deleteComment={deleteCommentWithPrompt}
              replyId={replyId}
              setReplyId={setReplyWithFocus}
              session={session}
              comment={c}
            />
          ))
        })()}
      </ul>
    </div>
  )
}

export function CommentCard({
  depth = 0,
  session,
  replyId,
  setReplyId,
  comment: { comment_id: commentId, user, created_at, body, children },
  deleteComment,
}: {
  comment: Comment
  depth?: number
  session: Session | null
  replyId: number | null
  setReplyId: (id: number) => void
  deleteComment: (id: number) => void
}) {
  const date = new Date(created_at)
  return (
    <li
      key={commentId}
      id={`comment_${commentId}`}
      className={clsx(`mt-4 rounded-l-lg`, depth > 0 && 'ml-4', commentId < 0 && 'opacity-50')}
    >
      <div
        className={clsx(
          'group rounded border-2 border-transparent p-1',
          commentId === replyId && 'border-brand-300 dark:border-brand-600',
        )}
      >
        <div className="flex flex-row gap-2 pr-2 text-sm">
          <Avatar avatar_url={user.avatar_url} />
          <div className="flex flex-col justify-center">
            <span className="font-bold dark:text-gray-200">{user.username}</span>
            <time className="cursor-help font-light text-gray-600 dark:text-gray-400">
              <a title={date.toLocaleString()}>{ago(date)}</a>
            </time>
          </div>
          {session && commentId > 0 && (
            <div className="ml-auto flex flex-row gap-2 lg:opacity-0 lg:group-hover:opacity-100">
              {session && session.user?.id === user.user_id && (
                <button onClick={() => deleteComment(commentId)}>
                  <TrashIcon
                    className="h-4 w-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    aria-hidden="true"
                  />
                </button>
              )}
              <button onClick={() => setReplyId(commentId)}>
                <ReplyIcon
                  className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </div>
        <div className="prose-p:brand-800 prose max-w-none whitespace-pre-wrap pt-2 text-gray-700 dark:prose-invert dark:text-gray-200 dark:prose-p:text-brand-100 ">
          {body}
        </div>
      </div>
      {children.length > 0 && (
        <ul>
          {children.map(c => (
            <CommentCard
              key={c.comment_id}
              comment={c}
              depth={depth + 1}
              replyId={replyId}
              setReplyId={setReplyId}
              session={session}
              deleteComment={deleteComment}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function Avatar({ avatar_url }: { avatar_url: string }) {
  return (
    <span className="relative inline-block">
      <img src={avatar_url} className="h-10 w-10 rounded-md" alt="" />
      <span className="absolute bottom-0 right-0 block translate-y-1/4 translate-x-1/4 transform rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 496 512"
          className="block h-5 w-5 rounded-full bg-gray-50 fill-current text-gray-900 dark:bg-gray-900 dark:text-gray-50"
        >
          <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
        </svg>
      </span>
    </span>
  )
}
