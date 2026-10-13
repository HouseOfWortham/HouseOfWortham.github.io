import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { HelpCircle, Send } from 'lucide-react'
import { AuthButton } from '@/components/AuthButton'
import { useAuth } from '@/components/AuthProvider'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { TybeeIcon } from '@/components/TybeeIcon'
import { getSupabaseClient, type ForumPostRow, type ForumReplyRow } from '@/lib/supabase'

export const Route = createFileRoute('/forum')({
  head: () => ({ meta: [{ title: 'Family Q&A · Tybee Tides' }] }),
  component: ForumPage,
})

type PostKind = ForumPostRow['kind']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function ForumPage() {
  const { session, isConfigured } = useAuth()
  const [posts, setPosts] = useState<ForumPostRow[]>([])
  const [replies, setReplies] = useState<ForumReplyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [kind, setKind] = useState<PostKind>('question')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [openPostId, setOpenPostId] = useState<string | null>(null)

  const loadForum = useCallback(async () => {
    if (!session) {
      setPosts([])
      setReplies([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const [postsResult, repliesResult] = await Promise.all([
        supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('forum_replies').select('*').order('created_at', { ascending: true }),
      ])
      if (postsResult.error) throw postsResult.error
      if (repliesResult.error) throw repliesResult.error
      setPosts(postsResult.data)
      setReplies(repliesResult.data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the family forum.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    void loadForum()
    if (!session) return
    window.addEventListener('focus', loadForum)
    return () => window.removeEventListener('focus', loadForum)
  }, [loadForum, session])

  useEffect(() => {
    if (!session) return
    let active = true
    let channel: RealtimeChannel | undefined

    void getSupabaseClient()
      .then((supabase) => {
        if (!active) return
        channel = supabase
          .channel('family-forum')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_posts' }, () => {
            void loadForum()
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, () => {
            void loadForum()
          })
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR' && active) {
              setError('Live forum updates could not connect. Refresh the page to see new posts and replies.')
            }
          })
      })
      .catch((channelError: unknown) => {
        if (active) {
          setError(channelError instanceof Error ? channelError.message : 'Could not connect to live forum updates.')
        }
      })

    return () => {
      active = false
      const activeChannel = channel
      if (activeChannel) {
        void getSupabaseClient().then((supabase) => supabase.removeChannel(activeChannel))
      }
    }
  }, [loadForum, session])

  const repliesByPost = useMemo(() => {
    const grouped = new Map<string, ForumReplyRow[]>()
    for (const reply of replies) {
      const postReplies = grouped.get(reply.post_id) ?? []
      postReplies.push(reply)
      grouped.set(reply.post_id, postReplies)
    }
    return grouped
  }, [replies])

  async function submitPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session || saving) return

    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const supabase = await getSupabaseClient()
      const { error: insertError } = await supabase.from('forum_posts').insert({
        user_id: session.user.id,
        kind,
        title: title.trim(),
        body: body.trim(),
      })
      if (insertError) throw insertError
      setTitle('')
      setBody('')
      setNotice('Your post has been shared with the family.')
      await loadForum()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your post.')
    } finally {
      setSaving(false)
    }
  }

  async function submitReply(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault()
    if (!session || saving || !replyBody.trim()) return

    setSaving(true)
    setError(null)
    setNotice(null)
    try {
      const supabase = await getSupabaseClient()
      const { error: insertError } = await supabase.from('forum_replies').insert({
        post_id: postId,
        user_id: session.user.id,
        body: replyBody.trim(),
      })
      if (insertError) throw insertError
      setReplyBody('')
      setNotice('Your reply has been added.')
      await loadForum()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not submit your reply.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Family Q&A"
        title="Questions, ideas & feedback"
        subtitle="Ask the family a question, share an idea, or help someone figure out the trip."
      />
      <section className="mx-auto max-w-4xl px-5 pb-24">
        {!session && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-sea/75">
              {isConfigured
                ? 'Sign in to read and contribute to the family Q&A.'
                : 'The family Q&A needs Supabase configured before it can be used.'}
            </p>
            <AuthButton />
          </div>
        )}

        {session && (
          <Reveal>
            <form onSubmit={submitPost} className="rounded-3xl bg-white p-6 shadow-[0_10px_40px_-20px_rgba(11,59,79,0.35)] sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-foam text-tide">
                  <TybeeIcon icon="chat" size={28} />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Start a conversation</h2>
                  <p className="text-sm text-sea/60">Posts are visible to signed-in family members.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
                <label className="text-sm font-semibold">
                  Post type
                  <select
                    value={kind}
                    onChange={(event) => setKind(event.target.value as PostKind)}
                    className="mt-1 w-full rounded-xl border border-sea/15 bg-white px-4 py-3 font-normal text-sea outline-none focus:border-tide focus:ring-2 focus:ring-tide/20"
                  >
                    <option value="question">Question</option>
                    <option value="feedback">Idea / feedback</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Title
                  <input
                    required
                    minLength={5}
                    maxLength={160}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="What would you like to ask?"
                    className="mt-1 w-full rounded-xl border border-sea/15 bg-white px-4 py-3 font-normal text-sea outline-none placeholder:text-sea/35 focus:border-tide focus:ring-2 focus:ring-tide/20"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm font-semibold">
                Details
                <textarea
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={4}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Add any details that will help the family respond…"
                  className="mt-1 w-full rounded-xl border border-sea/15 bg-white px-4 py-3 font-normal text-sea outline-none placeholder:text-sea/35 focus:border-tide focus:ring-2 focus:ring-tide/20"
                />
              </label>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-sea px-5 py-3 font-semibold text-white transition hover:bg-tide disabled:cursor-wait disabled:opacity-60"
                >
                  <Send size={16} /> {saving ? 'Posting…' : 'Post to the family'}
                </button>
              </div>
            </form>
          </Reveal>
        )}

        {(error || notice) && (
          <p role={error ? 'alert' : 'status'} className={`mt-5 rounded-2xl p-4 text-sm ${error ? 'bg-coral/10 text-[#9f3420]' : 'bg-foam text-tide'}`}>
            {error ?? notice}
          </p>
        )}

        <div className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-semibold tracking-widest text-tide uppercase">The conversation</p>
              <h2 className="mt-2 font-display text-3xl font-semibold">Family questions & ideas</h2>
            </div>
            {session && <span className="text-sm text-sea/55">{posts.length} posts</span>}
          </div>

          {!session ? (
            <div className="mt-6 rounded-2xl bg-white p-6 text-center text-sea/65 shadow">
              <HelpCircle className="mx-auto mb-2 text-tide" size={28} />
              Sign in to view the family conversation.
            </div>
          ) : loading ? (
            <p role="status" className="mt-6 text-sea/65">Loading family posts…</p>
          ) : posts.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-6 text-center text-sea/65 shadow">
              No posts yet. Start the conversation with a question or idea.
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {posts.map((post) => {
                const postReplies = repliesByPost.get(post.id) ?? []
                const expanded = openPostId === post.id
                return (
                  <article key={post.id} className="rounded-3xl bg-white p-6 shadow-[0_8px_30px_-20px_rgba(11,59,79,0.4)] sm:p-7">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.kind === 'question' ? 'bg-foam text-tide' : 'bg-sand text-sea'}`}>
                        {post.kind === 'question' ? 'Question' : 'Idea / feedback'}
                      </span>
                      <time className="text-xs text-sea/50">{formatDate(post.created_at)}</time>
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-semibold">{post.title}</h3>
                    <p className="mt-1 text-xs font-medium text-sea/55">Posted by {post.author_name}</p>
                    <p className="mt-4 whitespace-pre-wrap leading-relaxed text-sea/75">{post.body}</p>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenPostId(expanded ? null : post.id)
                        setError(null)
                      }}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-semibold text-sea transition hover:bg-foam"
                    >
                      <TybeeIcon icon="chat" size={18} />
                      {expanded ? 'Hide replies' : `${postReplies.length} ${postReplies.length === 1 ? 'reply' : 'replies'} · Reply`}
                    </button>

                    {expanded && (
                      <div className="mt-5 border-t border-sea/10 pt-5">
                        <div className="space-y-4">
                          {postReplies.map((reply) => (
                            <div key={reply.id} className="rounded-2xl bg-sand/70 p-4">
                              <div className="flex flex-wrap justify-between gap-2">
                                <span className="text-sm font-semibold">{reply.author_name}</span>
                                <time className="text-xs text-sea/50">{formatDate(reply.created_at)}</time>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-sea/75">{reply.body}</p>
                            </div>
                          ))}
                          {postReplies.length === 0 && <p className="text-sm text-sea/55">No replies yet. Be the first to respond.</p>}
                        </div>
                        <form onSubmit={(event) => void submitReply(event, post.id)} className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <label className="sr-only" htmlFor={`reply-${post.id}`}>Your reply</label>
                          <textarea
                            id={`reply-${post.id}`}
                            required
                            minLength={2}
                            maxLength={2000}
                            rows={2}
                            value={replyBody}
                            onChange={(event) => setReplyBody(event.target.value)}
                            placeholder="Write a helpful reply…"
                            className="min-w-0 flex-1 rounded-xl border border-sea/15 bg-white px-4 py-3 text-sm outline-none placeholder:text-sea/35 focus:border-tide focus:ring-2 focus:ring-tide/20"
                          />
                          <button
                            type="submit"
                            disabled={saving || !replyBody.trim()}
                            className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-full bg-tide px-5 py-3 text-sm font-semibold text-white transition hover:bg-sea disabled:cursor-wait disabled:opacity-60"
                          >
                            <Send size={15} /> Reply
                          </button>
                        </form>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
