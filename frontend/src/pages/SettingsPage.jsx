import { useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ImageDropzone from "../components/common/ImageDropzone";
import { useAuthUser } from "../context/AuthContext";

export default function SettingsPage() {
  const { user, setUser } = useAuthUser();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "", branch: user?.branch || "", year: user?.year || "" });
  const save = async (event) => {
    event.preventDefault();
    const { data } = await userApi.update({ ...form, year: form.year ? Number(form.year) : undefined });
    setUser(data.data.user);
    toast.success("Profile updated");
  };
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
    <Card className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <form onSubmit={save} className="mt-6 grid gap-4">
        <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <Input label="Branch" value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })} />
        <Input label="Year" type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Bio</span>
          <textarea className="input min-h-28" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
        </label>
        <Button>Save changes</Button>
      </form>
    </Card>
    <Card>
      <h2 className="text-lg font-extrabold">Profile media</h2>
      <div className="mt-5 space-y-5">
        <ImageDropzone
          label="Profile picture"
          currentUrl={user?.profilePicture}
          aspect="aspect-square"
          onUpload={async (formData, onProgress) => {
            const { data } = await userApi.uploadProfilePicture(formData, onProgress);
            setUser(data.data.user);
          }}
        />
        <ImageDropzone
          label="Cover image"
          currentUrl={user?.coverImage}
          onUpload={async (formData, onProgress) => {
            const { data } = await userApi.uploadCoverImage(formData, onProgress);
            setUser(data.data.user);
          }}
        />
      </div>
    </Card>
    </div>
  );
}
