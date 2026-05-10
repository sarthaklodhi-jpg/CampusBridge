import { useCallback, useEffect, useState } from "react";
import { notificationApi } from "../api/endpoints";
import EmptyState from "../components/common/EmptyState";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const addRealtimeNotification = useCallback((notification) => {
    setItems((current) => (current.some((item) => item._id === notification._id) ? current : [notification, ...current]));
  }, []);

  useRealtimeReady("notification:created", addRealtimeNotification);

  useEffect(() => {
    let active = true;
    notificationApi.list({ page: 1, limit: 30 }).then(({ data }) => {
      if (active) setItems(data.data.notifications);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!items.length) return <EmptyState title="No notifications" message="Likes, comments, replies, requests, and announcements will appear here." />;
  return <div className="space-y-3">{items.map((item) => <div key={item._id} className="surface rounded-lg p-4 text-sm">{item.message}</div>)}</div>;
}
