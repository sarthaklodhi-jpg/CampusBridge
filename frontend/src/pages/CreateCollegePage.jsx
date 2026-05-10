import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { collegeApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import { useAuthUser } from "../context/AuthContext";

export default function CreateCollegePage() {
  const { refreshMe } = useAuthUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", logo: "", bannerImage: "" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await collegeApi.create(form);
      await refreshMe();
      toast.success(`College created. Join code: ${data.data.college.joinCode}`);
      navigate("/college/manage");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create college");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader eyebrow="College owner setup" title="Create your college" description="Launch a verified student community with a secure join code and owner permissions." />
      <Card className="max-w-3xl">
        <form onSubmit={submit} className="grid gap-4">
          <Input label="College name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
            <textarea className="input min-h-32" value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What makes this campus community useful?" />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Logo URL" value={form.logo} onChange={(event) => update("logo", event.target.value)} placeholder="Optional" />
            <Input label="Banner image URL" value={form.bannerImage} onChange={(event) => update("bannerImage", event.target.value)} placeholder="Optional" />
          </div>
          <Button disabled={loading} className="mt-2 w-full sm:w-auto">Create college</Button>
        </form>
      </Card>
    </motion.div>
  );
}
