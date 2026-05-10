import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Outlet />
    </main>
  );
}
