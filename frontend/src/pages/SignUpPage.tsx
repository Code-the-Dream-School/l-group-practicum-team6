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

export default function SignUpPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(TOAST_MESSAGES.AUTH.SIGNUP_PASSWORDS_MISMATCH);
      return;
    }
    if (password.length < 8) {
      toast.error(TOAST_MESSAGES.AUTH.SIGNUP_PASSWORD_MIN_LENGTH);
      return;
    }

    if (!name || !email) {
      toast.error(TOAST_MESSAGES.AUTH.SIGNUP_MISSING_FIELDS);
      return;
    }

    setSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password); // trim user input
      toast.success(TOAST_MESSAGES.AUTH.SIGNUP_SUCCESS);
      navigate(ROUTES.EXPLORE, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : TOAST_MESSAGES.AUTH.SIGNUP_FALLBACK_ERROR);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-screen flex-col justify-between">
      <NavBar />
      <div className="flex flex-1 items-center justify-center bg-transparent px-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-120 flex-col gap-4 rounded-2xl border border-primary-border bg-surface p-10"
        >
          <div className="flex justify-center">
            <img src={logoFull} alt="Sonix Logo" className="h-7 w-auto" />
          </div>

          <h1 className="text-center text-[32px] font-semibold text-text-primary">
            Create your account
          </h1>

          <div className="flex flex-col gap-4 pt-[9px]">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-name" className="text-xs font-medium text-text-secondary">
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
              <label htmlFor="signup-email" className="text-xs font-medium text-text-secondary">
                Email Address
              </label>
              <input
                id="signup-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                pattern={'^\\S+@\\S+\\.\\S+$'}
                title="Please enter a valid email address, like: you@example.com"
                placeholder="you@example.com"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="input-field"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-password" className="text-xs font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-text-secondary cursor-pointer"
                >
                  <img src={showPassword ? eyeOffIcon : eyeIcon} alt="" className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="signup-confirm" className="text-xs font-medium text-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(ev) => setConfirmPassword(ev.target.value)}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-text-secondary cursor-pointer"
                >
                  <img src={showPassword ? eyeOffIcon : eyeIcon} alt="" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-3 h-12 w-full cursor-pointer justify-center py-0 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden
                />
                Signing up…
              </span>
            ) : (
              'Sign Up'
            )}
          </button>

          <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-text-secondary">Already have an account?</p>
            <Link to={ROUTES.LOGIN} className="text-sm text-primary">
              Log In
            </Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
