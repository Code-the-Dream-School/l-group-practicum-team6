import { useState, type SyntheticEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/useAuth";

import eyeIcon from "../assets/icons/eye.svg";
import logoFull from "../assets/logo-full.svg";

export default function SignUpPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

// todo: login form
// todo: navbar logout cleaning functions

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (!name || !email) {
            setError("Please fill in name and email");
            return;
        }

        setSubmitting(true);

        try {
            await register(name.trim(), email.trim(), password); // trim user input
            navigate("/explore", { replace: true });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Registration error",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex h-screen flex-col justify-between">
            <NavBar />
            <div className="flex flex-1 items-center justify-center bg-void px-4">
                <form
                    onSubmit={handleSubmit}
                    className="flex w-120 flex-col gap-4 rounded-2xl border border-primary-border bg-surface p-10"
                >
                    <div className="flex justify-center">
                        <img
                            src={logoFull}
                            alt="Sonix Logo"
                            className="h-7 w-auto"
                        />
                    </div>

                    <h1 className="text-center text-[32px] font-semibold text-text-primary">
                        Create your account
                    </h1>

                    <div className="flex flex-col gap-4 pt-[9px]">
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="signup-name"
                                className="text-xs font-medium text-text-secondary"
                            >
                                Full Name
                            </label>
                            <input
                                id="signup-name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                minLength={2}
                                placeholder="Alex Rivera"
                                value={name}
                                onChange={(ev) => setName(ev.target.value)}
                                className="input-field"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="signup-email"
                                className="text-xs font-medium text-text-secondary"
                            >
                                Email Address
                            </label>
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                required
                                pattern={"^\\S+@\\S+\\.\\S+$"}
                                title="Please enter a valid email address, like: you@example.com"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(ev) => setEmail(ev.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="signup-password"
                                className="text-xs font-medium text-text-secondary"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="signup-password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(ev) =>
                                        setPassword(ev.target.value)
                                    }
                                    className="input-field"
                                />
                                <div
                                    className="pointer-events-none absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-text-secondary"
                                    aria-hidden
                                >
                                    <img
                                        src={eyeIcon}
                                        alt=""
                                        className="h-4 w-4"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="signup-confirm"
                                className="text-xs font-medium text-text-secondary"
                            >
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="signup-confirm"
                                    name="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(ev) =>
                                        setConfirmPassword(ev.target.value)
                                    }
                                    className="input-field"
                                />
                                <div
                                    className="pointer-events-none absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-text-secondary"
                                    aria-hidden
                                >
                                    <img
                                        src={eyeIcon}
                                        alt=""
                                        className="h-4 w-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error ? (
                        <p className="text-center text-sm text-error" role="alert">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary mt-3 h-12 w-full cursor-pointer justify-center py-0 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Signing up…" : "Sign Up"}
                    </button>

                    <div className="flex items-center justify-center gap-1">
                        <p className="text-sm text-text-secondary">
                            Already have an account?
                        </p>
                        <Link to="/login" className="text-sm text-primary">
                            Log In
                        </Link>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
