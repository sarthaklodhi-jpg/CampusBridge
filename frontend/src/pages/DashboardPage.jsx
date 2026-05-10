import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { feedApi, userApi } from "../api/endpoints";
import FeedList from "../components/feed/FeedList";
import PostComposer from "../components/feed/PostComposer";
import UserCard from "../components/profile/UserCard";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useAuthUser } from "../context/AuthContext";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function DashboardPage() {
  const { user } = useAuthUser();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const addRealtimePost = useCallback(({ post }) => {
    setPosts((current) => (current.some((item) => item._id === post._id) ? current : [post, ...current]));
  }, []);

  useRealtimeReady("post:created", addRealtimePost);

  useEffect(() => {
    let active = true;
    if (!user?.college) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([feedApi.college({ page: 1, limit: 20 }), userApi.suggestions()])
      .then(([feed, users]) => {
        if (!active) return;
        setPosts(feed.data.data.posts);
        setSuggestions(users.data.data.users);
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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="surface rounded-lg p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-600">Start here</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">Set up your campus ecosystem</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Create a college if you are starting the community, or join with a code or invite link from your admin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/college/create"><Button>Create college</Button></Link>
            <Link to="/college/join"><Button variant="ghost">Join college</Button></Link>
          </div>
        </section>
        <Card>
          <h2 className="font-extrabold">Why this matters</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">CampusBridge keeps private college discussions isolated while still allowing public cross-college knowledge sharing.</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1fr_21rem]">
      <section className="space-y-4">
        <PostComposer onCreated={(post) => setPosts((current) => [post, ...current])} />
        <FeedList posts={posts} loading={loading} emptyTitle="Your college feed is quiet" />
      </section>
      <aside className="space-y-4">
        <Card>
          <h2 className="font-extrabold">People to know</h2>
          <div className="mt-4 space-y-3">{suggestions.map((user) => <UserCard key={user._id} user={user} />)}</div>
        </Card>
      </aside>
    </motion.div>
  );
}
