import { useEffect, useState } from "react";
import { searchApi } from "../api/endpoints";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";
import UserCard from "../components/profile/UserCard";
import PostCard from "../components/feed/PostCard";
import { useDebounce } from "../hooks/useDebounce";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState({ users: [], posts: [], colleges: [] });
  const debounced = useDebounce(q);

  useEffect(() => {
    let active = true;
    if (!debounced) {
      setResults({ users: [], posts: [], colleges: [] });
      return undefined;
    }
    searchApi.global({ q: debounced, limit: 5 }).then(({ data }) => {
      if (active) setResults(data.data);
    });
    return () => {
      active = false;
    };
  }, [debounced]);

  return (
    <div className="space-y-5">
      <SearchBar value={q} onChange={setQ} />
      {!q && <EmptyState title="Search the network" message="Find students, posts, colleges, and tags across your accessible ecosystem." />}
      {!!results.users.length && <section className="grid gap-3 sm:grid-cols-2">{results.users.map((user) => <UserCard key={user._id} user={user} />)}</section>}
      {!!results.posts.length && <section className="space-y-4">{results.posts.map((post) => <PostCard key={post._id} post={post} />)}</section>}
    </div>
  );
}
