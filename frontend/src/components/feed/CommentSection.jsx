import { AnimatePresence, motion } from "framer-motion";
import { Heart, MessageCircle, SendHorizontal, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, memo } from "react";
import toast from "react-hot-toast";
import { commentApi } from "../../api/endpoints";
import { useAuthUser } from "../../context/AuthContext";
import { useRealtimeReady } from "../../hooks/useRealtimeReady";
import Button from "../common/Button";
import EmptyState from "../common/EmptyState";
import Skeleton from "../common/Skeleton";

function CommentForm({ postId, parent, onCreated, autoFocus = false, compact = false }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    const optimistic = {
      _id: `temp-${crypto.randomUUID()}`,
      post: postId,
      parent: parent || null,
      content,
      author: null,
      likes: [],
      repliesCount: 0,
      createdAt: new Date().toISOString(),
      optimistic: true
    };
    onCreated(optimistic);
    setContent("");
    setLoading(true);
    try {
      const { data } = await commentApi.create({ postId, parent, content });
      onCreated(data.data.comment, optimistic._id);
    } catch (error) {
      onCreated(null, optimistic._id, true);
      toast.error(error.response?.data?.message || "Could not add comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={`flex items-start gap-3 ${compact ? "mt-3" : ""}`}>
      <textarea
        autoFocus={autoFocus}
        className="input min-h-12 resize-none py-3"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder={parent ? "Write a reply..." : "Add to the discussion..."}
      />
      <Button disabled={loading || !content.trim()} className="px-3">
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
}

function CommentItem({ comment, postId, depth = 0, onDeleted }) {
  const { user } = useAuthUser();
  const [item, setItem] = useState(comment);
  const [replying, setReplying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const isMine = item.author?._id === user?._id;
  const likesCount = item.likes?.length || 0;

  const loadReplies = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (replies.length) return;
    setLoadingReplies(true);
    try {
      const { data } = await commentApi.list(postId, { parent: item._id });
      setReplies(data.data.comments.filter((entry) => !entry.deletedAt));
    } finally {
      setLoadingReplies(false);
    }
  };

  const like = async () => {
    const wasLiked = item.likes?.some((id) => id === user?._id);
    setItem((current) => ({
      ...current,
      likes: wasLiked ? current.likes.filter((id) => id !== user?._id) : [...(current.likes || []), user._id]
    }));
    try {
      await commentApi.like(item._id);
    } catch {
      toast.error("Could not update like");
    }
  };

  const remove = async () => {
    const estimatedCount = Math.max(1, 1 + (item.repliesCount || 0));
    onDeleted?.(item._id, estimatedCount, item);
    try {
      const { data } = await commentApi.remove(item._id);
      const actualCount = data.data.deletedCount || estimatedCount;
      if (actualCount !== estimatedCount) onDeleted?.(item._id, actualCount - estimatedCount);
    } catch (error) {
      onDeleted?.(item._id, -estimatedCount, item, true);
      toast.error(error.response?.data?.message || "Could not delete comment");
    }
  };

  const addReply = (next, tempId, removeOnly = false) => {
    if (removeOnly) {
      setReplies((current) => current.filter((entry) => entry._id !== tempId));
      return;
    }
    if (tempId) {
      setReplies((current) => current.map((entry) => (entry._id === tempId ? next : entry)));
      return;
    }
    setReplies((current) => [next, ...current]);
    setItem((current) => ({ ...current, repliesCount: (current.repliesCount || 0) + 1 }));
    setExpanded(true);
  };

  const removeReply = (id, countDelta = 1, snapshot, restore = false) => {
    if (restore && snapshot) {
      setReplies((current) => (current.some((entry) => entry._id === snapshot._id) ? current : [snapshot, ...current]));
    } else if (id) {
      setReplies((current) => current.filter((entry) => entry._id !== id));
    }
    const directDelta = countDelta > 0 ? 1 : countDelta < 0 ? -1 : 0;
    setItem((current) => ({ ...current, repliesCount: Math.max(0, (current.repliesCount || 0) - directDelta) }));
    onDeleted?.(id, countDelta);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className={depth ? "ml-5 border-l border-slate-200 pl-4 dark:border-slate-800" : ""}>
      <div className="rounded-lg bg-slate-50/80 p-4 dark:bg-slate-900/70">
        <div className="flex items-start gap-3">
          <img className="h-9 w-9 rounded-full object-cover" src={item.author?.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${item.author?.name || "Student"}`} alt="" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">{item.author?.name || "You"}</p>
              {item.optimistic && <span className="text-xs font-semibold text-slate-400">sending</span>}
              <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{item.content}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              <button onClick={like} className="inline-flex items-center gap-1 transition hover:text-coral"><Heart className="h-3.5 w-3.5" /> {likesCount}</button>
              <button onClick={() => setReplying((value) => !value)} className="inline-flex items-center gap-1 transition hover:text-brand-600"><MessageCircle className="h-3.5 w-3.5" /> Reply</button>
              {isMine && <button onClick={remove} className="inline-flex items-center gap-1 transition hover:text-coral"><Trash2 className="h-3.5 w-3.5" /> Delete</button>}
            </div>
          </div>
        </div>
        <AnimatePresence>
          {replying && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <CommentForm postId={postId} parent={item._id} onCreated={addReply} autoFocus compact />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {(item.repliesCount > 0 || replies.length > 0) && (
        <button onClick={loadReplies} className="mt-2 text-xs font-extrabold text-brand-600">
          {expanded ? "Hide replies" : `View ${item.repliesCount || replies.length} replies`}
        </button>
      )}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-3 space-y-3">
            {loadingReplies ? <Skeleton lines={2} /> : replies.map((reply) => <MemoizedCommentItem key={reply._id} comment={reply} postId={postId} depth={depth + 1} onDeleted={removeReply} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Memoize CommentItem to prevent re-renders of unchanged comments
const MemoizedCommentItem = memo(CommentItem, (prev, next) => {
  return (
    prev.comment?._id === next.comment?._id &&
    prev.comment?.likes?.length === next.comment?.likes?.length &&
    prev.comment?.content === next.comment?.content &&
    prev.postId === next.postId
  );
});

export default function CommentSection({ postId, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const addRealtimeComment = useCallback(({ postId: eventPostId, comment }) => {
    if (eventPostId !== postId || comment.parent) return;
    setComments((current) => (current.some((item) => item._id === comment._id) ? current : [comment, ...current]));
    onCountChange?.(1);
  }, [postId, onCountChange]);

  useRealtimeReady("comment:created", addRealtimeComment);

  useEffect(() => {
    let active = true;
    commentApi
      .list(postId, { page: 1, limit: 30 })
      .then(({ data }) => {
        if (active) setComments(data.data.comments.filter((comment) => !comment.deletedAt));
      })
      .catch((error) => toast.error(error.response?.data?.message || "Could not load comments"))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId]);

  const addComment = (next, tempId, removeOnly = false) => {
    if (removeOnly) {
      setComments((current) => current.filter((entry) => entry._id !== tempId));
      onCountChange?.(-1);
      return;
    }
    if (tempId) {
      setComments((current) => current.map((entry) => (entry._id === tempId ? next : entry)));
      return;
    }
    setComments((current) => [next, ...current]);
    onCountChange?.(1);
  };

  const removeComment = (id, countDelta = 1, snapshot, restore = false) => {
    if (restore && snapshot) {
      setComments((current) => (current.some((entry) => entry._id === snapshot._id) ? current : [snapshot, ...current]));
    } else if (id) {
      setComments((current) => current.filter((entry) => entry._id !== id));
    }
    onCountChange?.(-countDelta);
  };

  return (
    <div className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800">
      <CommentForm postId={postId} onCreated={addComment} />
      <div className="mt-5 space-y-3">
        {loading ? (
          <Skeleton lines={3} />
        ) : comments.length ? (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => <CommentItem key={comment._id} comment={comment} postId={postId} onDeleted={removeComment} />)}
          </AnimatePresence>
        ) : (
          <EmptyState title="No comments yet" message="Start the discussion with a thoughtful comment or reply." />
        )}
      </div>
    </div>
  );
}
