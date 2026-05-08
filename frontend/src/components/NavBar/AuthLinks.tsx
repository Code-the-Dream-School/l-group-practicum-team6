import { Link } from "react-router-dom";

import { Routes } from "../../routes/paths";

export function AuthLinks() {
  return (
    <>
      <Link to={Routes.LOGIN} className="btn-ghost">
        Log In
      </Link>
      <Link to={Routes.SIGNUP} className="btn-primary">
        Sign Up
      </Link>
    </>
  );
}
