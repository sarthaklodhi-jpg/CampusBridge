import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { collegeApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import { useAuthUser } from "../context/AuthContext";

export default function JoinCollegePage() {
  const { inviteCode } = useParams();
  const { refreshMe } = useAuthUser();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inviteCode) setJoinCode("");
  }, [inviteCode]);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await collegeApi.join(inviteCode ? { inviteCode } : { joinCode });
      await refreshMe();
      toast.success("You joined the college");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not join college");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <PageHeader eyebrow="Verified access" title={inviteCode ? "Join from invite" : "Join a college"} description="Enter through a secure join code or invite link issued by your college owner or admins." />
      <Card className="max-w-xl">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <KeyRound className="h-6 w-6" />
          </div>
          {inviteCode ? (
            <div className="rounded-lg bg-slate-100 p-4 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">Invite code detected from link.</div>
          ) : (
            <Input label="Join code" value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="CBR-92KD-XA" required />
          )}
          <Button disabled={loading} className="w-full">Join college</Button>
        </form>
      </Card>
    </motion.div>
  );
}
