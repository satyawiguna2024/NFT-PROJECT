import { Outlet, Navigate } from "react-router";
import { useAccount } from "wagmi";

export default function ProtectedRoute() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Navigate to={"/"} replace />;
  }

  return <Outlet />;
}
