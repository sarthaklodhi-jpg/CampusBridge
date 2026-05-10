import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState, memo } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { feedApi } from "../../api/endpoints";
import CommentSection from "./CommentSection";

// Custom comparison function to prevent unnecessary re-renders
const arePostsEqual = (prev, next) => {
  return (
    prev.post?._id === next.post?._id &&
    prev.post?.likes?.length === next.post?.likes?.length &&
    prev.post?.commentsCount === next.post?.commentsCount &&
    prev.post?.content === next.post?.content
  );
};

function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  useEffect(() => {
    setLikes(post.likes?.length || 0);
  }, [post.likes?.length]);

  useEffect(() => {
    setCommentsCount(post.commentsCount || 0);
  }, [post.commentsCount]);

  const like = async () => {
    setLiked((value) => !value);
    setLikes((value) => value + (liked ? -1 : 1));
    try {
      await feedApi.like(post._id);
    } catch {
      setLiked((value) => !value);
      setLikes((value) => value + (liked ? 1 : -1));
    }
  };

  const save = async () => {
    await feedApi.save(post._id);
    toast.success("Post saved");
  };

  return (
    <article className="surface rounded-lg p-5">
      <div className="flex items-start gap-3">
        <img className="h-11 w-11 rounded-full object-cover" src={post.author?.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${post.author?.name || "CB"}`} alt="" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/profile/${post.author?.username}`} className="font-bold hover:text-brand-600">{post.author?.name || "Student"}</Link>
            <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold capitalize text-brand-700">{post.type}</span>
            {post.isPublic && <span className="rounded-full bg-mint/10 px-2 py-1 text-xs font-bold text-emerald-700">Public</span>}
          </div>
          <p className="mt-1 text-xs text-slate-500">{post.college?.name || "Cross-college"} · {new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700 dark:text-slate-200">{post.content}</p>
      {!!post.tags?.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">#{tag}</span>)}
        </div>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <button onClick={like} className={`flex items-center gap-2 text-sm font-bold ${liked ? "text-coral" : "text-slate-500 hover:text-coral"}`}>
          <Heart className="h-4 w-4" /> {likes}
        </button>
        <button onClick={() => setCommentsOpen((value) => !value)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600">
          <MessageCircle className="h-4 w-4" /> {commentsCount}
        </button>
        <button onClick={save} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600">
          <Bookmark className="h-4 w-4" /> Save
        </button>
        <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
      {commentsOpen && <CommentSection postId={post._id} onCountChange={(delta) => setCommentsCount((value) => Math.max(0, value + delta))} />}
    </article>
  );
}

export default memo(PostCard, arePostsEqual);
