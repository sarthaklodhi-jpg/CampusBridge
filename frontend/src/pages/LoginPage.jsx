import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthCard from "../components/auth/AuthCard";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useAuthActions } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuthActions();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your verified student community." footerText="New here?" footerLink="/register" footerLabel="Create account">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input label="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <Button className="w-full">Login</Button>
      </form>
    </AuthCard>
  );
}
