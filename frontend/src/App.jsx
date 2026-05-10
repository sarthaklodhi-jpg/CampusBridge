import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  const location = useLocation();
  return (
    <SocketProvider>
      <AnimatePresence mode="wait">
        <AppRoutes key={location.pathname} />
      </AnimatePresence>
    </SocketProvider>
  );
}
