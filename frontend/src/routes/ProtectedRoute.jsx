import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "../context/AuthContext";
import Loader from "../components/common/Loader";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthState();
  if (loading) return <Loader fullScreen />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
