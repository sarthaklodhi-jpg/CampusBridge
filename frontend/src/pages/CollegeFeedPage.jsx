import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { feedApi } from "../api/endpoints";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import FeedList from "../components/feed/FeedList";
import PostComposer from "../components/feed/PostComposer";
import { useAuthUser } from "../context/AuthContext";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function CollegeFeedPage() {
  const { user } = useAuthUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addRealtimePost = useCallback(({ post }) => {
    setPosts((current) => (current.some((item) => item._id === post._id) ? current : [post, ...current]));
  }, []);

  const updateRealtimeLike = useCallback(({ postId, likesCount }) => {
    setPosts((current) => current.map((post) => (post._id === postId ? { ...post, likes: Array.from({ length: likesCount }) } : post)));
  }, []);

  useRealtimeReady("post:created", addRealtimePost);
  useRealtimeReady("post:liked", updateRealtimeLike);

  useEffect(() => {
    let active = true;
    if (!user?.college) {
      setLoading(false);
      return;
    }
    setLoading(true);
    feedApi.college({ page: 1, limit: 20 })
      .then(({ data }) => {
        if (active) setPosts(data.data.posts);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.college]);
  if (!user?.college) {
    return (
      <div className="space-y-4">
        <EmptyState title="Join a college first" message="The college feed unlocks after you create or join a verified campus community." />
        <Link to="/onboarding"><Button>Set up college access</Button></Link>
      </div>
    );
  }
  return <div className="space-y-4"><PostComposer onCreated={(post) => setPosts((current) => [post, ...current])} /><FeedList posts={posts} loading={loading} emptyTitle="No college posts yet" /></div>;
}
