import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { ROUTES } from '@sonix/shared';
import { TOAST_MESSAGES } from '@sonix/shared';

import eyeIcon from '../assets/icons/eye.svg';
import eyeOffIcon from '../assets/icons/eyeOff.svg';
import logoFull from '../assets/logo-full.svg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();

    if (!email || !password) {
      toast.error(TOAST_MESSAGES.AUTH.LOGIN_MISSING_FIELDS);
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success(TOAST_MESSAGES.AUTH.LOGIN_SUCCESS);
      navigate(ROUTES.EXPLORE, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : TOAST_MESSAGES.AUTH.LOGIN_FALLBACK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col justify-between">
      <NavBar />
      <div className="flex items-center justify-center bg-transparent px-4 flex-1">
        <form
          onSubmit={handleSubmit}
          className="flex w-120 flex-col gap-4 p-10 rounded-2xl border border-primary-border bg-surface"
        >
          <div className="flex justify-center">
            <img src={logoFull} alt="Sonix Logo" className="h-7 w-auto" />
          </div>

          <h1 className="text-center text-[32px] font-semibold text-text-primary">Welcome back</h1>

          <div className="flex flex-col gap-4 pt-[9px]">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 cursor-pointer text-text-secondary"
                >
                  <img
                    src={showPassword ? eyeOffIcon : eyeIcon}
                    alt=""
                    className="h-4 w-4 cursor-pointer"
                  />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-3 h-12 w-full justify-center py-0 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden
                />
                Signing in...
              </span>
            ) : (
              'Log In'
            )}
          </button>

          <div className="flex justify-center items-center gap-1">
            <p className="text-sm text-text-secondary">Don't have an account?</p>
            <Link to={ROUTES.SIGNUP} className="text-sm text-primary">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
