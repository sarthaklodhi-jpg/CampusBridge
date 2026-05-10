import { Bookmark, ExternalLink, FileText, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { resourceApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import Skeleton from "../components/common/Skeleton";
import { useDebounce } from "../hooks/useDebounce";

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const debounced = useDebounce(q);
  const [form, setForm] = useState({ title: "", description: "", category: "", resourceUrl: "", resourceType: "link", tags: "" });

  useEffect(() => {
    let active = true;
    setLoading(true);
    resourceApi.list({ q: debounced || undefined, page: 1, limit: 20 }).then(({ data }) => {
      if (active) setResources(data.data.resources);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debounced]);

  const create = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      const { data } = await resourceApi.create(payload);
      setResources((current) => [data.data.resource, ...current]);
      setForm({ title: "", description: "", category: "", resourceUrl: "", resourceType: "link", tags: "" });
      toast.success("Resource shared");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not share resource");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Knowledge base" title="Resource Library" description="Share notes, PDFs, assignments, drive links, and study material with your college." />
      <Card>
        <form onSubmit={create} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <Input label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
          </div>
          <Input label="Resource URL" value={form.resourceUrl} onChange={(event) => setForm({ ...form, resourceUrl: event.target.value })} placeholder="PDF, Drive, Notion, GitHub, or any useful link" required />
          <Input label="Tags" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="dsa, semester-4, interview" />
          <textarea className="input min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" />
          <Button className="w-fit"><Plus className="h-4 w-4" /> Share resource</Button>
        </form>
      </Card>
      <SearchBar value={q} onChange={setQ} placeholder="Search resources, categories, tags..." />
      {loading ? <Skeleton lines={4} /> : !resources.length ? <EmptyState title="No resources yet" message="Share the first notes, assignment, or study guide for your college." /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((item) => (
            <article key={item._id} className="surface rounded-lg p-5">
              <div className="flex items-start justify-between gap-3">
                <FileText className="h-6 w-6 text-brand-600" />
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600 dark:bg-slate-800 dark:text-slate-300">{item.category}</span>
              </div>
              <h2 className="mt-4 text-lg font-extrabold">{item.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.description || "Shared campus resource"}</p>
              <div className="mt-4 flex flex-wrap gap-2">{item.tags?.map((tag) => <span key={tag} className="rounded-full bg-brand-50 px-2 py-1 text-xs font-bold text-brand-700">#{tag}</span>)}</div>
              <div className="mt-5 flex gap-2">
                <a className="btn-primary flex-1" href={item.resourceUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Open</a>
                <button className="btn-ghost px-3" onClick={() => resourceApi.save(item._id).then(() => toast.success("Resource saved"))}><Bookmark className="h-4 w-4" /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
