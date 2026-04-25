import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = false;

  return isAuthenticated ? <Navigate to="/explore" /> : children;
}
