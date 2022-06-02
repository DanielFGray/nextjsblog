import { useState, useRef } from 'react'
import ago from 's-ago'
import { useRouter } from 'next/router'
import { useSignIn, useAuth, useCreateComment, useLogout, useDeleteComment } from '~/lib/comments'
import type { Comment } from '~/lib/comments'
import { TrashIcon, ReplyIcon } from '@heroicons/react/solid'
import { Session } from '@supabase/supabase-js'

const providers = [
  // { provider: 'twitter', label: 'Twitter' },
  { provider: 'github', label: 'GitHub' },
] as const

export function Comments({ comments }: { comments: undefined | Comment[] }) {
  const [replyId, setReplyId] = useState<null | number>(null)
  const { slug } = useRouter().query
  const formref = useRef<HTMLFormElement | null>(null)
  const session = useAuth()
  const deleteComment = useDeleteComment()
  const newcomment = useCreateComment()
  const logout = useLogout()
  const signin = useSignIn()
  return (
    <div className="mx-auto mt-4 flex max-w-5xl flex-col gap-2 bg-gray-50 p-4 text-gray-900 shadow-lg dark:bg-gray-800 dark:text-gray-200 md:rounded lg:max-w-5xl lg:rounded-lg">
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
                  onClick={() =>
                    signin.mutate({ provider, redirectTo: `/blog/${slug}#comment_section` })
                  }
                >
                  sign in with {provider}
                </button>
              ))}
            </div>
          )
        }

        return (
          <form
            ref={formref}
            onReset={() => setReplyId(null)}
            onSubmit={ev => {
              ev.preventDefault()
              try {
                const formData = new FormData(ev.currentTarget)
                const values = Object.fromEntries(formData.entries())
                if (
                  ! (
                    values.comment &&
                    typeof values.comment === 'string' &&
                    slug &&
                    typeof slug === 'string'
                  )
                ) {
                  return
                }
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
            }}
          >
            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-500"
              >
                {replyId ? `responding to #${replyId}:` : 'add your comment:'}
              </label>
              <div className="my-2">
                <textarea
                  rows={4}
                  name="comment"
                  id="comment"
                  placeholder="say something nice!"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white sm:text-sm"
                  required
                  disabled={newcomment.isLoading}
                />
              </div>
            </div>
            <div className="flex flex-row justify-start gap-2">
              <button
                type="submit"
                className="inline-flex items-center rounded-md border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={newcomment.isLoading}
              >
                {newcomment.isLoading ? 'sending...' : 'post'}
              </button>
              <button
                type="reset"
                onClick={() => formref.current?.reset()}
                className="inline-flex items-center rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:outline-gray-700 hover:dark:bg-gray-900"
              >
                cancel
              </button>
              <button
                type="reset"
                onClick={() => logout.mutate()}
                className="ml-auto inline-flex items-center rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm outline outline-1 outline-gray-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-white dark:outline-gray-700"
              >
                log out
              </button>
            </div>
            {replyId && <input type="hidden" name="parent_id" value={replyId} />}
          </form>
        )
      })()}
      <ul className="space-y-2">
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
              deleteComment={deleteComment.mutate}
              setReplyId={id => {
                formref.current?.focus()
                setReplyId(id)
              }}
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
  setReplyId,
  comment: { comment_id, user, created_at, body, children },
  deleteComment,
}: {
  comment: Comment
  depth?: number
  session: Session | null
  setReplyId: (id: number) => void
  deleteComment: (id: number) => void
}) {
  const date = new Date(created_at)
  return (
    <li key={comment_id} id={`comment_${comment_id}`} className={`pt-2 ${depth > 0 ? 'ml-2' : ''}`}>
      <div className="flex flex-row gap-2">
        <span className="font-bold dark:text-gray-200">{user.username}</span>
        <time className="cursor-help text-gray-600 dark:text-gray-400">
          <a title={date.toLocaleString()}>{ago(date)}</a>
        </time>
        {session && (
          <div className="ml-auto flex flex-row gap-2">
            <button onClick={() => setReplyId(comment_id)}>
              <ReplyIcon
                className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-hidden="true"
              />
            </button>
            <button onClick={() => deleteComment(comment_id)}>
              <TrashIcon
                className="h-4 w-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </div>
      <div className="prose max-w-none whitespace-pre-wrap text-gray-700 dark:prose-invert dark:text-gray-200">
        {body}
      </div>
      {children.length > 0 && (
        <ul>
          {children.map(c => (
            <CommentCard
              key={c.comment_id}
              comment={c}
              depth={depth + 1}
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
