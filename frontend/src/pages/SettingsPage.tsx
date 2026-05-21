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
      const response = await fetch(ApiEndpoints.USER_ME_PASSWORD, {
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
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF]">
      <NavBar />

      <main className="mx-auto flex w-full max-w-[720px] flex-col gap-8 px-6 pb-24 pt-16">
        <section className="w-full">
          <h1 className="text-[32px] font-semibold leading-[51.2px] text-[#F0F0FF]">Settings</h1>
        </section>

        <section className="w-full rounded-xl border border-[#2A2A3D] bg-[#12121A] p-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-[#F0F0FF]">Profile</h2>

              <div className="flex flex-col gap-2">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#00E5FF] text-[32px] font-semibold leading-8 text-[#F0F0FF]">
                  {initial}
                </div>
                <p className="text-xs leading-[19.2px] text-[#8888AA]">
                  Avatar is generated from your name and account ID.
                </p>
              </div>

              <div className="flex w-full max-w-[480px] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="display-name"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={draftDisplayName}
                    onChange={(ev) => setDraftDisplayName(ev.target.value)}
                    className="h-10 w-full rounded-lg border border-[#2A2A3D] bg-[#0A0A0F] px-3 text-sm text-[#F0F0FF] outline-none transition focus:border-[#7C5CFC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email-address"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    Email Address
                  </label>
                  <input
                    id="email-address"
                    type="email"
                    value={email}
                    readOnly
                    className="h-10 w-full cursor-not-allowed rounded-lg border border-[#2A2A3D] bg-[#0A0A0F] px-3 text-sm text-[#F0F0FF] opacity-70 outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="inline-flex h-10 w-full max-w-[240px] cursor-pointer items-center justify-center rounded-lg bg-[#7C5CFC] px-4 text-sm font-medium text-[#F0F0FF] transition hover:brightness-110 disabled:cursor-not-allowed"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>

              {profileError ? (
                <p className="text-sm text-[#FF4D6D]" role="alert">
                  {profileError}
                </p>
              ) : null}

              {profileSaved && !profileError ? (
                <p className="text-sm text-[#00E5FF]">Profile updated successfully.</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-4 border-t border-[#2A2A3D] pt-12">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-[#F0F0FF]">Account</h2>

              <h3 className="pt-2 text-lg font-medium leading-[25.2px] text-[#F0F0FF]">
                Change Password
              </h3>

              <div className="flex w-full max-w-[480px] flex-col gap-4 pb-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="current-password"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
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
                    className="h-10 w-full rounded-lg border border-[#2A2A3D] bg-[#0A0A0F] px-3 text-sm text-[#F0F0FF] outline-none transition focus:border-[#7C5CFC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(ev) => setNewPassword(ev.target.value)}
                    onBlur={validatePasswordMatch}
                    className="h-10 w-full rounded-lg border border-[#2A2A3D] bg-[#0A0A0F] px-3 text-sm text-[#F0F0FF] outline-none transition focus:border-[#7C5CFC]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(ev) => setConfirmPassword(ev.target.value)}
                    onBlur={validatePasswordMatch}
                    className="h-10 w-full rounded-lg border border-[#2A2A3D] bg-[#0A0A0F] px-3 text-sm text-[#F0F0FF] outline-none transition focus:border-[#7C5CFC]"
                  />
                </div>
              </div>

              {passwordError ? (
                <p className="text-sm text-[#FF4D6D]" role="alert">
                  {passwordError}
                </p>
              ) : null}

              {passwordSaved && !passwordError ? (
                <p className="text-sm text-[#00E5FF]">Password updated successfully.</p>
              ) : null}

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={disableUpdatePassword}
                className="inline-flex h-10 w-full max-w-[240px] cursor-pointer items-center justify-center rounded-lg bg-[#7C5CFC] px-4 text-sm font-medium text-[#F0F0FF] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>

              <div className="pt-8">
                <button
                  type="button"
                  className="inline-flex h-10 w-full max-w-[240px] cursor-pointer items-center justify-center rounded-lg border border-[#FF4D6D] px-4 text-sm font-medium text-[#FF4D6D] transition hover:bg-[#FF4D6D]/10"
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
