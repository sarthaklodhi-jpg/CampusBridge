import { memo } from "react";
import EmptyState from "../common/EmptyState";
import Skeleton from "../common/Skeleton";
import PostCard from "./PostCard";

// Custom comparison for FeedList memoization
const areFeedsEqual = (prev, next) => {
  if (prev.loading !== next.loading) return false;
  if (prev.posts?.length !== next.posts?.length) return false;
  if (prev.emptyTitle !== next.emptyTitle) return false;
  // Compare post IDs rather than full objects
  return prev.posts?.every((p, i) => p._id === next.posts[i]._id);
};

function FeedList({ posts, loading, emptyTitle = "Nothing here yet" }) {
  if (loading) return <div className="space-y-4"><Skeleton /><Skeleton /></div>;
  if (!posts?.length) return <EmptyState title={emptyTitle} message="Once people start sharing, the best conversations will show up here." />;
  return <div className="space-y-4">{posts.map((post) => <PostCard key={post._id} post={post} />)}</div>;
}

export default memo(FeedList, areFeedsEqual);
