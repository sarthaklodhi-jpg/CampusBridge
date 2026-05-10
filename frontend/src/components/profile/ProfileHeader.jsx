export default function ProfileHeader({ user }) {
  return (
    <section className="surface overflow-hidden rounded-lg p-0">
      <div className="h-36 bg-gradient-to-r from-brand-600 via-sky-500 to-mint" style={user.coverImage ? { backgroundImage: `url(${user.coverImage})`, backgroundSize: "cover" } : undefined} />
      <div className="px-5 pb-5">
        <img className="-mt-12 h-24 w-24 rounded-full border-4 border-white bg-white object-cover dark:border-slate-900" src={user.profilePicture || `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`} alt="" />
        <div className="mt-3">
          <h1 className="text-2xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-slate-500">@{user.username} · {user.college?.name || "No college joined"}</p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{user.bio || "Building their campus network."}</p>
        </div>
      </div>
    </section>
  );
}
