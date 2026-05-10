import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { feedApi } from "../../api/endpoints";
import Button from "../common/Button";

export default function PostComposer({ onCreated }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("discussion");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data } = await feedApi.create({ content, type, isPublic, tags: [] });
      onCreated?.(data.data.post);
      setContent("");
      toast.success("Post published");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not publish post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="surface rounded-lg p-5">
      <textarea className="input min-h-28 resize-none" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a question, resource, or discussion with your campus..." />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {["discussion", "question", "resource", "announcement"].map((item) => (
            <button type="button" key={item} onClick={() => setType(item)} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${type === item ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
            Public
          </label>
          <Button disabled={loading}>
            <SendHorizontal className="h-4 w-4" /> Post
          </Button>
        </div>
      </div>
    </form>
  );
}
