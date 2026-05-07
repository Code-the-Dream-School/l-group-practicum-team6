import { Link, useNavigate } from "react-router-dom";
import logoFull from "../assets/logo-full.svg";
import { useAuth } from "../context/useAuth";

const NavBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
        navigate("/", { replace: true });
    }

    return (
        <div className="flex h-16 items-center justify-between bg-surface px-20">
            <Link to="/">
                <img src={logoFull} alt="Sonix" />
            </Link>
            <div className="inline-flex items-center gap-4">
                {user ? (
                    <>
                        <p className="text-sm font-medium text-text-secondary">
                            Hi, {user.name}
                        </p>
                        <button
                            type="button"
                            className="btn-primary cursor-pointer"
                            onClick={() => void handleLogout()}
                        >
                            Log out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn-ghost">
                            Log In
                        </Link>
                        <Link to="/signup" className="btn-primary">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default NavBar;
