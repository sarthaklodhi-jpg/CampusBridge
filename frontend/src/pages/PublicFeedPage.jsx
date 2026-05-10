import { useCallback, useEffect, useState } from "react";
import { feedApi } from "../api/endpoints";
import FeedList from "../components/feed/FeedList";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function PublicFeedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addRealtimePost = useCallback(({ post }) => {
    if (!post?.isPublic) return;
    setPosts((current) => (current.some((item) => item._id === post._id) ? current : [post, ...current]));
  }, []);

  useRealtimeReady("post:created", addRealtimePost);

  useEffect(() => {
    let active = true;
    feedApi.public({ page: 1, limit: 20 })
      .then(({ data }) => {
        if (active) setPosts(data.data.posts);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return <FeedList posts={posts} loading={loading} emptyTitle="No public posts yet" />;
}
