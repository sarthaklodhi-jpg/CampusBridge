import { ImagePlus, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function ImageDropzone({ label, currentUrl, onUpload, aspect = "aspect-[16/9]" }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(currentUrl);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const validate = (file) => {
    if (!file) return false;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Use JPG, PNG, WEBP, or GIF");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return false;
    }
    return true;
  };

  const upload = async (file) => {
    if (!validate(file)) return;
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setLoading(true);
    setProgress(1);
    const formData = new FormData();
    formData.append("image", file);
    try {
      await onUpload(formData, (event) => {
        if (event.total) setProgress(Math.round((event.loaded * 100) / event.total));
      });
      toast.success(`${label} updated`);
    } catch (error) {
      setPreview(currentUrl);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          upload(event.dataTransfer.files?.[0]);
        }}
        className={`group relative w-full overflow-hidden rounded-lg border border-dashed transition ${aspect} ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:border-brand-400 dark:border-slate-700 dark:bg-slate-900"}`}
      >
        {preview ? (
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <ImagePlus className="mx-auto h-8 w-8 text-brand-600" />
              <p className="mt-3 text-sm font-bold">Drop image here or browse</p>
              <p className="mt-1 text-xs text-slate-500">JPG, PNG, WEBP, GIF up to 5MB</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 grid place-items-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100">
          <UploadCloud className="h-8 w-8" />
        </div>
        {loading && <div className="absolute bottom-0 left-0 h-1 bg-brand-600 transition-all" style={{ width: `${progress}%` }} />}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
    </div>
  );
}
