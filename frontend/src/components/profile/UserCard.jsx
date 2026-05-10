import { UserPlus } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";

// Custom comparison to prevent re-renders when user data hasn't changed
const areUsersEqual = (prev, next) => {
  return (
    prev.user?._id === next.user?._id &&
    prev.user?.name === next.user?.name &&
    prev.user?.username === next.user?.username &&
    prev.user?.profilePicture === next.user?.profilePicture
  );
};

function UserCard({ user }) {
  return (
    <div className="surface rounded-lg p-4">
      <div className="flex items-center gap-3">
        <img className="h-12 w-12 rounded-full object-cover" src={user.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} alt="" />
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${user.username}`} className="font-bold hover:text-brand-600">{user.name}</Link>
          <p className="truncate text-sm text-slate-500">{user.branch || user.bio || "Student"}</p>
        </div>
        <button className="btn-ghost px-3" aria-label="Connect">
          <UserPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default memo(UserCard, areUsersEqual);
