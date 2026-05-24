import { useEffect, useState } from 'react';
import { ApiEndpoints } from '@sonix/shared';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/useAuth';
import { getInitial } from './../utils/getInitial';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [draftDisplayName, setDraftDisplayName] = useState(user?.name ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const currentName = user?.name ?? '';
    setDisplayName(currentName);
    setDraftDisplayName(currentName);
  }, [user?.name]);

  const email = user?.email ?? '';
  const initial = getInitial(displayName);
  const disableUpdatePassword =
    savingPassword ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    Boolean(passwordError);

  async function handleSaveProfile() {
    const trimmedName = draftDisplayName.trim();
    setProfileError(null);
    setProfileSaved(false);

    if (!trimmedName) {
      setProfileError('Display name cannot be empty');
      return;
    }

    if (trimmedName === (user?.name ?? '')) {
      setProfileSaved(true);
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({ name: trimmedName });
      setDisplayName(trimmedName);
      setProfileSaved(true);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSavingProfile(false);
    }
  }

  function validatePasswordMatch() {
    if (!newPassword || !confirmPassword) {
      setPasswordError(null);
      setPasswordSaved(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and Confirm Password do not match');
      setPasswordSaved(false);
      return;
    }

    setPasswordError(null);
  }

  async function handleUpdatePassword() {
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and Confirm Password do not match');
      return;
    }

    setPasswordError(null);
    setSavingPassword(true);

    try {
      const response = await fetch(ApiEndpoints.USER_PASSWORD, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        let message = 'Failed to update password';

        try {
          const body = (await response.json()) as { error?: { message?: string } };
          if (body.error?.message) {
            message = body.error.message;
          }
        } catch {
          message = 'Unable to read server error. Please try again.';
        }

        throw new Error(message);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-void text-text-primary">
      <NavBar />

      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-6 pb-24 pt-16">
        <section className="w-full">
          <h1 className="text-[32px] font-semibold leading-[51.2px] text-text-primary">Settings</h1>
        </section>

        <section className="w-full rounded-xl border border-primary-border bg-surface p-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-text-primary">Profile</h2>

              <div className="flex flex-col gap-2">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[32px] font-semibold leading-8 text-text-primary">
                  {initial}
                </div>
                <p className="text-xs leading-[19.2px] text-text-secondary">
                  Avatar is generated from your name and account ID.
                </p>
              </div>

              <div className="flex w-full max-w-[480px] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="display-name"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={draftDisplayName}
                    onChange={(ev) => setDraftDisplayName(ev.target.value)}
                    onBlur={handleSaveProfile}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email-address"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    value={email}
                    readOnly
                    className="input-field cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              {profileError ? (
                <p className="text-sm text-error" role="alert">
                  {profileError}
                </p>
              ) : null}

              {savingProfile ? <p className="text-sm text-text-secondary">Saving...</p> : null}

              {profileSaved && !profileError ? (
                <p className="text-sm text-secondary">Profile updated successfully.</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 border-t border-primary-border pt-12">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-text-primary">Account</h2>

              <h3 className="pt-2 text-lg font-medium leading-[25.2px] text-text-primary">
                Change Password
              </h3>

              <div className="flex w-full max-w-[480px] flex-col gap-4 pb-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="current-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(ev) => {
                      setCurrentPassword(ev.target.value);
                      setPasswordError(null);
                    }}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.target.value)}
                    onBlur={validatePasswordMatch}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    onBlur={validatePasswordMatch}
                    className="input-field focus-visible:border-primary"
                  />
                </div>
              </div>

              {passwordError ? (
                <p className="text-sm text-error" role="alert">
                  {passwordError}
                </p>
              ) : null}

              {passwordSaved && !passwordError ? (
                <p className="text-sm text-secondary">Password updated successfully.</p>
              ) : null}

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={disableUpdatePassword}
                className="btn-primary h-10 w-full max-w-[240px] cursor-pointer justify-center text-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>

              <div className="pt-8">
                <button
                  type="button"
                  className="btn-ghost h-10 w-full max-w-[240px] cursor-pointer justify-center border-error text-error transition hover:bg-error/10"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
