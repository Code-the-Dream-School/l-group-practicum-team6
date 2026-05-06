import { Link } from "react-router-dom";
import logoFull from "../assets/logo-full.svg";

const NavBar = () => {
    return (
        <div className="bg-surface px-[80px] h-[64px] flex items-center justify-between">
            <Link to="/">
                <img src={logoFull} alt="Sonix" className="" />
            </Link>
            <div className="flex flex-inline items-center gap-4">
                <Link to="/login" className="btn-ghost">
                    Log In
                </Link>
                <Link to="/signup" className="btn-primary">
                    Sign Up
                </Link>
            </div>
        </div>
    );
};

export default NavBar;