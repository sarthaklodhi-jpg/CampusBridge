import { Flag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { reportApi } from "../api/endpoints";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";

export default function ModerationPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportApi.list().then(({ data }) => setReports(data.data.reports)).finally(() => setLoading(false));
  }, []);

  const update = async (id, status) => {
    const { data } = await reportApi.update(id, { status, resolutionNote: "" });
    setReports((current) => current.map((item) => (item._id === id ? data.data.report : item)));
    toast.success("Report updated");
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Community safety" title="Moderation" description="Review reports from students and track moderation decisions." />
      {loading ? <Skeleton lines={5} /> : !reports.length ? <EmptyState title="No reports" message="Reported posts, comments, or users will appear in this queue." /> : (
        <div className="space-y-3">
          {reports.map((report) => (
            <article key={report._id} className="surface rounded-lg p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-coral" />
                    <p className="text-sm font-extrabold">{report.targetType} report · {report.status}</p>
                  </div>
                  <h2 className="mt-2 text-lg font-extrabold">{report.reason}</h2>
                  <p className="mt-1 text-sm text-slate-500">{report.details || "No additional details provided."}</p>
                  <p className="mt-2 text-xs text-slate-400">Reported by {report.reportedBy?.name || "Student"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => update(report._id, "dismissed")}>Dismiss</Button>
                  <Button onClick={() => update(report._id, "resolved")}>Resolve</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
