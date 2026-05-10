import { Megaphone, Pin, SendHorizontal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { announcementApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";
import { useAuthUser } from "../context/AuthContext";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function AnnouncementsPage() {
  const { user } = useAuthUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "", priority: "normal", pinned: false });
  const canCreate = ["college_admin", "college_owner", "super_admin"].includes(user?.role);

  const addRealtimeAnnouncement = useCallback(({ announcement }) => {
    setItems((current) => (current.some((item) => item._id === announcement._id) ? current : [announcement, ...current]));
  }, []);

  const updateRealtimeAnnouncement = useCallback(({ announcement }) => {
    setItems((current) => current.map((item) => (item._id === announcement._id ? announcement : item)));
  }, []);

  const removeRealtimeAnnouncement = useCallback(({ announcementId }) => {
    setItems((current) => current.filter((item) => item._id !== announcementId));
  }, []);

  useRealtimeReady("announcement:created", addRealtimeAnnouncement);
  useRealtimeReady("announcement:updated", updateRealtimeAnnouncement);
  useRealtimeReady("announcement:deleted", removeRealtimeAnnouncement);

  useEffect(() => {
    let active = true;
    announcementApi.list({ page: 1, limit: 20 }).then(({ data }) => {
      if (active) setItems(data.data.announcements);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      const { data } = await announcementApi.create(form);
      setItems((current) => [data.data.announcement, ...current]);
      setForm({ title: "", content: "", priority: "normal", pinned: false });
      toast.success("Announcement published");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not publish announcement");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Official updates"
        title="Announcements"
        description="Pinned and priority-based college notices from owners and admins."
        action={<div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-600"><Megaphone className="h-5 w-5" /></div>}
      />
      {canCreate && (
        <Card>
          <form onSubmit={create} className="grid gap-4">
            <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Content</span>
              <textarea className="input min-h-28" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {["normal", "important", "urgent"].map((priority) => (
                  <button type="button" key={priority} onClick={() => setForm({ ...form, priority })} className={`rounded-lg px-3 py-2 text-xs font-extrabold capitalize ${form.priority === priority ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {priority}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={form.pinned} onChange={(event) => setForm({ ...form, pinned: event.target.checked })} />
                  Pinned
                </label>
                <Button><SendHorizontal className="h-4 w-4" /> Publish</Button>
              </div>
            </div>
          </form>
        </Card>
      )}
      {loading ? <Skeleton lines={4} /> : !items.length ? (
        <EmptyState title="No announcements yet" message="Official college updates will appear here." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item._id} className={`surface rounded-lg p-5 ${item.priority === "urgent" ? "border-coral/50" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                {item.pinned && <span className="inline-flex items-center gap-1 rounded-full bg-amber/15 px-2 py-1 text-xs font-extrabold text-amber"><Pin className="h-3 w-3" /> Pinned</span>}
                <span className={`rounded-full px-2 py-1 text-xs font-extrabold capitalize ${item.priority === "urgent" ? "bg-coral/10 text-coral" : item.priority === "important" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{item.priority}</span>
              </div>
              <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">{item.content}</p>
              <p className="mt-4 text-xs font-semibold text-slate-400">By {item.createdBy?.name || "Admin"} · {new Date(item.createdAt).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
