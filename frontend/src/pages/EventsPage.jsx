import { Bookmark, CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { eventApi } from "../api/endpoints";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";
import { useAuthUser } from "../context/AuthContext";
import { useRealtimeReady } from "../hooks/useRealtimeReady";

export default function EventsPage() {
  const { user } = useAuthUser();
  const canCreate = ["college_admin", "college_owner", "super_admin"].includes(user?.role);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", type: "workshop", startsAt: "", location: "", organizer: "", bannerImage: "" });

  const addRealtimeEvent = useCallback(({ event }) => {
    setEvents((current) => (current.some((item) => item._id === event._id) ? current : [event, ...current]));
  }, []);

  const updateRealtimeRsvp = useCallback(({ eventId, rsvpCount }) => {
    setEvents((current) => current.map((event) => (event._id === eventId ? { ...event, rsvps: Array.from({ length: rsvpCount }) } : event)));
  }, []);

  useRealtimeReady("event:created", addRealtimeEvent);
  useRealtimeReady("event:rsvp_updated", updateRealtimeRsvp);

  useEffect(() => {
    let active = true;
    eventApi.list({ page: 1, limit: 20 }).then(({ data }) => {
      if (active) setEvents(data.data.events);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const create = async (event) => {
    event.preventDefault();
    try {
      const { data } = await eventApi.create(form);
      setEvents((current) => [data.data.event, ...current]);
      setForm({ title: "", description: "", type: "workshop", startsAt: "", location: "", organizer: "", bannerImage: "" });
      toast.success("Event created");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not create event");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Campus calendar" title="Events" description="Hackathons, workshops, contests, seminars, and campus meetups." />
      {canCreate && (
        <Card>
          <form onSubmit={create} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              <Input label="Date and time" type="datetime-local" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required />
              <Input label="Organizer" value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} />
            </div>
            <textarea className="input min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Event details" />
            <Button className="w-fit"><Plus className="h-4 w-4" /> Create event</Button>
          </form>
        </Card>
      )}
      {loading ? <Skeleton lines={4} /> : !events.length ? <EmptyState title="No upcoming events" message="Admin-created events will appear here with RSVP and bookmarks." /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {events.map((item) => (
            <article key={item._id} className="surface overflow-hidden rounded-lg">
              <div className="h-32 bg-gradient-to-r from-brand-600 via-sky-500 to-mint" style={item.bannerImage ? { backgroundImage: `url(${item.bannerImage})`, backgroundSize: "cover" } : undefined} />
              <div className="p-5">
                <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-extrabold capitalize text-brand-700">{item.type}</span>
                <h2 className="mt-4 text-xl font-extrabold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p>
                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-500">
                  <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {new Date(item.startsAt).toLocaleString()}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {item.location}</span>
                </div>
                <div className="mt-5 flex gap-2">
                  <button className="btn-primary flex-1" onClick={() => eventApi.rsvp(item._id).then(() => toast.success("RSVP updated"))}><Users className="h-4 w-4" /> RSVP</button>
                  <button className="btn-ghost px-3" onClick={() => eventApi.bookmark(item._id).then(() => toast.success("Event bookmarked"))}><Bookmark className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
