import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const currentName = user?.name ?? '';
    setDisplayName(currentName);
    setDraftDisplayName(currentName);
  }, [user?.name]);

  const email = user?.email ?? '';
  const initial = getInitial(displayName);

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
                    className="input-field"
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
                    className="input-field cursor-not-allowed"
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
                <p className="text-sm text-error" role="alert">
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
                  <input id="current-password" type="password" className="input-field" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    New Password
                  </label>
                  <input id="new-password" type="password" className="input-field" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-medium leading-[19.2px] text-[#8888AA]"
                  >
                    Confirm Password
                  </label>
                  <input id="confirm-password" type="password" className="input-field" />
                </div>
              </div>

              <button
                type="button"
                className="inline-flex h-10 w-full max-w-[240px] cursor-pointer items-center justify-center rounded-lg bg-[#7C5CFC] px-4 text-sm font-medium text-[#F0F0FF] transition hover:brightness-110"
              >
                Update Password
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
