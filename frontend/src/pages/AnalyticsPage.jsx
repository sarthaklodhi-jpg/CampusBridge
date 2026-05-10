import { BarChart3, CalendarDays, FileText, Flag, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsApi } from "../api/endpoints";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";

const metrics = [
  ["members", "Members", Users],
  ["posts", "Posts", MessageSquare],
  ["resources", "Resources", FileText],
  ["events", "Events", CalendarDays],
  ["openReports", "Open reports", Flag],
  ["admins", "Admins", BarChart3]
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    analyticsApi.college().then(({ data }) => setAnalytics(data.data.analytics));
  }, []);

  if (!analytics) return <Skeleton lines={5} />;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="College intelligence" title="Analytics" description="Track community activity, content volume, and operational health." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(([key, label, Icon]) => (
          <Card key={key}>
            <Icon className="h-5 w-5 text-brand-600" />
            <p className="mt-5 text-3xl font-extrabold">{analytics[key] ?? 0}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-extrabold">Trending tags</h2>
        {!analytics.trendingTags?.length ? <EmptyState title="No tag trends yet" message="Tags will appear as students post more discussions and resources." /> : (
          <div className="mt-4 flex flex-wrap gap-2">
            {analytics.trendingTags.map((item) => <span key={item.tag} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">#{item.tag} · {item.count}</span>)}
          </div>
        )}
      </Card>
    </div>
  );
}
