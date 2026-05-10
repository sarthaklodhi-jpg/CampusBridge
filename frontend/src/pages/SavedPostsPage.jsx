import { useEffect, useState } from "react";
import { feedApi } from "../api/endpoints";
import FeedList from "../components/feed/FeedList";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    feedApi.saved({ page: 1, limit: 20 })
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
  return <FeedList posts={posts} loading={loading} emptyTitle="No saved posts" />;
}
