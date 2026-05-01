import { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
    children,
}: {
    children: JSX.Element;
}) {
    const isAuthenticated = false;

    return isAuthenticated ? children : <Navigate to="/login" />;
}
