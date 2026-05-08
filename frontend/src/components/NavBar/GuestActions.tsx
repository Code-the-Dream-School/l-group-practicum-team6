import { Link } from "react-router-dom";

export function GuestActions() {
  return (
    <>
      <Link to="/login" className="btn-ghost">
        Log In
      </Link>
      <Link to="/signup" className="btn-primary">
        Sign Up
      </Link>
    </>
  );
}
