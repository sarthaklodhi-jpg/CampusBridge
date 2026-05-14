import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthCard from "../components/auth/AuthCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthActions } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuthActions();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", branch: "", year: "", joinCode: "" });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await register({ ...form, year: form.year ? Number(form.year) : undefined });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthCard title="Join your campus" subtitle="Create your student profile and optionally enter a college join code." footerText="Already registered?" footerLink="/login" footerLabel="Login">
      <form onSubmit={submit} className="grid gap-4">
        <Input label="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
        <Input label="Username" value={form.username} onChange={(event) => update("username", event.target.value)} required />
        <Input label="Email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Branch" value={form.branch} onChange={(event) => update("branch", event.target.value)} />
          <Input label="Year" type="number" min="1" max="8" value={form.year} onChange={(event) => update("year", event.target.value)} />
        </div>
        <Input
          label="College join code (optional)"
          value={form.joinCode}
          onChange={(event) => update("joinCode", event.target.value.toUpperCase())}
          placeholder="CBR-2DD5-C1"
          helperText="Optional for now. For testing, you can use: CBR-2DD5-C1"
        />
        <Button className="w-full">Create account</Button>
      </form>
    </AuthCard>
  );
}
