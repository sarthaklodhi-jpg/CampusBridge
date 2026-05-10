import { motion } from "framer-motion";
import { Copy, Crown, Link2, MoreVertical, ShieldCheck, Trash2, UserMinus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { collegeApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";
import ImageDropzone from "../components/common/ImageDropzone";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import Skeleton from "../components/common/Skeleton";
import { useAuthUser } from "../context/AuthContext";
import { useDebounce } from "../hooks/useDebounce";

const roleLabel = {
  student: "Student",
  college_admin: "Admin",
  college_owner: "Owner",
  super_admin: "Super Admin"
};

export default function CollegeManagementPage() {
  const { user, refreshMe } = useAuthUser();
  const [college, setCollege] = useState(null);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({ expiresInHours: 168, maxUses: "" });
  const [collegeForm, setCollegeForm] = useState({ name: "", description: "", tags: "", website: "", linkedin: "", instagram: "" });
  const [confirm, setConfirm] = useState(null);
  const debounced = useDebounce(q);
  const isOwner = user?.role === "college_owner" || user?.role === "super_admin";

  const inviteBase = `${window.location.origin}/join`;

  const load = useCallback(async () => {
    const [collegeRes, memberRes, inviteRes] = await Promise.all([
      collegeApi.mine(),
      collegeApi.members({ q: debounced || undefined, page: 1, limit: 30 }),
      collegeApi.invites()
    ]);
    setCollege(collegeRes.data.data.college);
    const nextCollege = collegeRes.data.data.college;
    setCollegeForm({
      name: nextCollege?.name || "",
      description: nextCollege?.description || "",
      tags: nextCollege?.tags?.join(", ") || "",
      website: nextCollege?.socialLinks?.website || "",
      linkedin: nextCollege?.socialLinks?.linkedin || "",
      instagram: nextCollege?.socialLinks?.instagram || ""
    });
    setMembers(memberRes.data.data.members);
    setInvites(inviteRes.data.data.invites);
    setLoading(false);
  }, [debounced]);

  useEffect(() => {
    load().catch((error) => {
      toast.error(error.response?.data?.message || "Could not load college management");
      setLoading(false);
    });
  }, [load]);

  const joinCode = college?.joinCode;
  const ownerId = college?.owner?._id;

  const activeInvites = useMemo(() => invites.filter((invite) => !invite.revokedAt), [invites]);

  const createInvite = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        expiresInHours: Number(inviteForm.expiresInHours),
        ...(inviteForm.maxUses ? { maxUses: Number(inviteForm.maxUses) } : {})
      };
      const { data } = await collegeApi.createInvite(payload);
      setInvites((current) => [data.data.invite, ...current]);
      toast.success("Invite link created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create invite");
    }
  };

  const saveCollegeProfile = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: collegeForm.name,
        description: collegeForm.description,
        tags: collegeForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        socialLinks: {
          website: collegeForm.website,
          linkedin: collegeForm.linkedin,
          instagram: collegeForm.instagram
        }
      };
      const { data } = await collegeApi.update(payload);
      setCollege(data.data.college);
      toast.success("College profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update college");
    }
  };

  const copyText = async (text, label) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const updateRole = async (member, role) => {
    try {
      await collegeApi.updateRole(college._id, member._id, role);
      setMembers((current) => current.map((item) => (item._id === member._id ? { ...item, role } : item)));
      toast.success("Role updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update role");
    }
  };

  const removeMember = async (member) => {
    setConfirm({
      title: "Remove member?",
      message: `${member.name} will lose access to this college ecosystem.`,
      confirmLabel: "Remove",
      action: async () => {
        await collegeApi.removeMember(member._id);
        setMembers((current) => current.filter((item) => item._id !== member._id));
        toast.success("Member removed");
      }
    });
  };

  const transferOwner = async (member) => {
    setConfirm({
      title: "Transfer ownership?",
      message: `${member.name} will become the college owner. Your role will become college admin.`,
      confirmLabel: "Transfer",
      action: async () => {
        await collegeApi.transferOwner(member._id);
        await refreshMe();
        await load();
        toast.success("Ownership transferred");
      }
    });
  };

  const leaveCollege = async () => {
    setConfirm({
      title: "Leave college?",
      message: "You will lose access to the private college feed and admin permissions. Owners must transfer ownership first.",
      confirmLabel: "Leave",
      action: async () => {
        await collegeApi.leave();
        await refreshMe();
        window.location.assign("/onboarding");
      }
    });
  };

  const runConfirm = async () => {
    try {
      await confirm.action();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setConfirm(null);
    }
  };

  if (loading) return <Skeleton lines={5} />;
  if (!college) return <EmptyState title="No college found" message="Create or join a college to unlock management tools." />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        eyebrow="College command center"
        title={college.name}
        description="Manage members, roles, invites, and ownership from one secure dashboard."
        action={<Button variant="ghost" onClick={leaveCollege}>Leave college</Button>}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-4">
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold">Members</h2>
                <p className="text-sm text-slate-500">{college.studentsCount} students in this ecosystem</p>
              </div>
              <div className="w-full sm:w-72"><SearchBar value={q} onChange={setQ} placeholder="Search members" /></div>
            </div>
            <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <div key={member._id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <img className="h-11 w-11 rounded-full object-cover" src={member.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${member.name}`} alt="" />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{member.name}</p>
                      <p className="truncate text-sm text-slate-500">@{member.username} · {member.branch || "Student"}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${member.role === "college_owner" ? "bg-amber/15 text-amber" : member.role === "college_admin" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                    {roleLabel[member.role] || member.role}
                  </span>
                  {isOwner && member._id !== ownerId && (
                    <div className="flex flex-wrap gap-2">
                      {member.role === "college_admin" ? (
                        <button className="btn-ghost px-3 py-2 text-xs" onClick={() => updateRole(member, "student")}>Demote</button>
                      ) : (
                        <button className="btn-ghost px-3 py-2 text-xs" onClick={() => updateRole(member, "college_admin")}>Promote</button>
                      )}
                      <button className="btn-ghost px-3 py-2 text-xs" onClick={() => transferOwner(member)}><Crown className="h-3.5 w-3.5" /> Owner</button>
                      <button className="btn-ghost px-3 py-2 text-xs text-coral" onClick={() => removeMember(member)}><UserMinus className="h-3.5 w-3.5" /> Remove</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-4">
          {isOwner && (
            <Card>
              <h2 className="font-extrabold">College profile</h2>
              <form onSubmit={saveCollegeProfile} className="mt-4 grid gap-3">
                <Input label="Name" value={collegeForm.name} onChange={(event) => setCollegeForm({ ...collegeForm, name: event.target.value })} />
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Description</span>
                  <textarea className="input min-h-24" value={collegeForm.description} onChange={(event) => setCollegeForm({ ...collegeForm, description: event.target.value })} />
                </label>
                <Input label="Tags" value={collegeForm.tags} onChange={(event) => setCollegeForm({ ...collegeForm, tags: event.target.value })} placeholder="engineering, coding, design" />
                <Input label="Website" value={collegeForm.website} onChange={(event) => setCollegeForm({ ...collegeForm, website: event.target.value })} />
                <Button>Save profile</Button>
              </form>
              <div className="mt-5 space-y-4">
                <ImageDropzone
                  label="College logo"
                  currentUrl={college.logo}
                  aspect="aspect-square"
                  onUpload={async (formData, onProgress) => {
                    const { data } = await collegeApi.uploadLogo(formData, onProgress);
                    setCollege(data.data.college);
                  }}
                />
                <ImageDropzone
                  label="College banner"
                  currentUrl={college.bannerImage}
                  onUpload={async (formData, onProgress) => {
                    const { data } = await collegeApi.uploadBanner(formData, onProgress);
                    setCollege(data.data.college);
                  }}
                />
              </div>
            </Card>
          )}
          <Card>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-brand-600" />
              <h2 className="font-extrabold">Join code</h2>
            </div>
            <div className="mt-4 rounded-lg bg-slate-100 p-4 font-mono text-lg font-extrabold tracking-wider dark:bg-slate-800">{joinCode}</div>
            <Button variant="ghost" className="mt-3 w-full" onClick={() => copyText(joinCode, "Join code")}><Copy className="h-4 w-4" /> Copy code</Button>
          </Card>

          <Card>
            <h2 className="font-extrabold">Invite links</h2>
            <form onSubmit={createInvite} className="mt-4 grid gap-3">
              <Input label="Expires in hours" type="number" min="1" max="720" value={inviteForm.expiresInHours} onChange={(event) => setInviteForm({ ...inviteForm, expiresInHours: event.target.value })} />
              <Input label="Usage limit" type="number" min="1" value={inviteForm.maxUses} onChange={(event) => setInviteForm({ ...inviteForm, maxUses: event.target.value })} placeholder="Optional" />
              <Button><Link2 className="h-4 w-4" /> Generate invite</Button>
            </form>
            <div className="mt-4 space-y-3">
              {activeInvites.slice(0, 4).map((invite) => {
                const url = `${inviteBase}/${invite.code}`;
                return (
                  <div key={invite._id} className="rounded-lg border border-slate-100 p-3 text-sm dark:border-slate-800">
                    <p className="truncate font-semibold">{url}</p>
                    <p className="mt-1 text-xs text-slate-500">{invite.uses} uses{invite.maxUses ? ` / ${invite.maxUses}` : ""}</p>
                    <div className="mt-2 flex gap-2">
                      <button className="text-xs font-bold text-brand-600" onClick={() => copyText(url, "Invite link")}>Copy</button>
                      <button className="text-xs font-bold text-coral" onClick={() => collegeApi.revokeInvite(invite._id).then(() => setInvites((current) => current.map((item) => item._id === invite._id ? { ...item, revokedAt: new Date().toISOString() } : item)))}>Revoke</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>

      <ConfirmDialog open={Boolean(confirm)} {...confirm} onCancel={() => setConfirm(null)} onConfirm={runConfirm} />
    </motion.div>
  );
}
