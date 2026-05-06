import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import logoFull from "../assets/logo-full.svg";
import eyeIcon from "../assets/icons/eye.svg";
import { Link } from "react-router-dom";

export default function LoginPage() {

    const handleLogin = () => {
        console.log(" --login--");
    };

    return (
        <div className="flex h-screen flex-col justify-between">
            <NavBar />
            <div className="flex items-center justify-center bg-void px-4 py-10 flex-1">
                <div className="flex w-120 flex-col gap-4 p-10 rounded-2xl border border-primary-border bg-surface">
                    <div className="flex justify-center">
                        <img src={logoFull} alt="Sonix Logo" className="h-7 w-auto" />
                    </div>

                    <h1 className="text-center text-[32px] font-semibold text-text-primary">
                        Welcome back
                    </h1>

                    <div className="flex flex-col gap-4 pt-[9px]">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-text-secondary">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input-field"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                className="text-xs font-medium text-text-secondary"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="input-field"
                                />
                                <div
                                    className="absolute right-3 top-3 items-center justify-center text-text-secondary"
                                    aria-hidden
                                >
                                    <img
                                        src={eyeIcon}
                                        alt=""
                                        className="h-4 w-4 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="btn-primary mt-3 h-12 w-full justify-center py-0 text-sm cursor-pointer" onClick={handleLogin}>
                        Log In
                    </button>

                    <div className="flex justify-center items-center gap-1">
                        <p className="text-sm text-text-secondary">
                            Don't have an account?
                        </p>
                        <Link to="/signup" className="text-sm text-primary">Sign Up</Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
