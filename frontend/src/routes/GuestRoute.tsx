import { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function GuestRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/explore" replace />;
    }

    return children;
}
