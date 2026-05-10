import { Building2, KeyRound, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import { useAuthUser } from "../context/AuthContext";

export default function OnboardingPage() {
  const { user } = useAuthUser();

  return (
    <div>
      <PageHeader
        eyebrow="Campus setup"
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Create a verified college community or join an existing one with a code or invite link."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="group overflow-hidden">
          <PlusCircle className="h-8 w-8 text-brand-600" />
          <h2 className="mt-5 text-xl font-extrabold">Create a college</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Start a private campus ecosystem, become the owner, and invite your first members.</p>
          <Link className="btn-primary mt-6 w-full" to="/college/create">Create college</Link>
        </Card>
        <Card>
          <KeyRound className="h-8 w-8 text-mint" />
          <h2 className="mt-5 text-xl font-extrabold">Join a college</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use a join code or invite link from your college admin to enter the verified community.</p>
          <Link className="btn-ghost mt-6 w-full" to="/college/join">Join with code</Link>
        </Card>
      </div>
      <div className="surface mt-6 rounded-lg p-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-brand-600" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">One account can belong to exactly one college at a time.</p>
        </div>
      </div>
    </div>
  );
}
