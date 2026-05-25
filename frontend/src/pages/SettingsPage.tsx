import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { changePassword, deleteAccount } from '../api/users';
import { useAuth } from '../context/useAuth';
import { getInitial } from './../utils/getInitial';
import { Routes } from '../routes/paths';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const email = user?.email ?? '';
  const initial = getInitial(user?.name ?? '');
  const disableUpdatePassword =
    savingPassword ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    Boolean(passwordError);
  const disableDeleteAccount = deletingAccount || !deletePassword;

  async function handleSaveProfile(nextDisplayName: string) {
    const trimmedName = nextDisplayName.trim();
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
      await changePassword({ currentPassword, newPassword });

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

  function openDeleteModal() {
    setDeleteError(null);
    setDeletePassword('');
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (deletingAccount) return;

    setDeleteError(null);
    setDeletePassword('');
    setIsDeleteModalOpen(false);
  }

  async function handleDeleteAccount() {
    if (disableDeleteAccount) return;

    setDeleteError(null);
    setDeletingAccount(true);

    try {
      await deleteAccount(deletePassword);

      setIsDeleteModalOpen(false);
      await logout();
      navigate(Routes.HOME);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
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
                <div className="glass-card h-20 w-20 justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[32px] font-semibold leading-8 text-text-primary">
                  {initial}
                </div>
                <p className="text-xs leading-[19.2px] text-text-secondary">
                  Avatar is generated from your name and account ID.
                </p>
              </div>

              <div className="flex w-full max-w-[480px] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-center gap-1">
                    <label
                      htmlFor="display-name"
                      className="text-xs font-medium leading-[19.2px] text-text-secondary"
                    >
                      Display Name
                    </label>
                    <span className="group relative inline-flex items-center">
                      <button
                        type="button"
                        aria-describedby="display-name-tooltip"
                        aria-label="Display name auto-save info"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-primary-border bg-surface text-[10px] leading-none text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        i
                      </button>
                      <span
                        id="display-name-tooltip"
                        role="tooltip"
                        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg border border-primary-border bg-surface px-3 py-2 text-xs leading-5 text-text-secondary shadow-lg group-hover:block group-focus-within:block"
                      >
                        Your display name is auto-saved when you leave this field.
                      </span>
                    </span>
                  </div>
                  <input
                    id="display-name"
                    type="text"
                    key={user?.name ?? ''}
                    defaultValue={user?.name ?? ''}
                    onBlur={(ev) => {
                      void handleSaveProfile(ev.target.value);
                    }}
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
                  onClick={openDeleteModal}
                  className="btn-ghost h-10 w-full max-w-[240px] cursor-pointer justify-center border-error text-error transition hover:bg-error/10"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-xl border border-primary-border bg-surface p-6">
            <h3 id="delete-account-title" className="text-xl font-semibold text-text-primary">
              Delete Account
            </h3>
            <p className="mt-2 text-sm text-text-secondary">
              This action is permanent and cannot be undone. Enter your password to confirm.
            </p>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="delete-account-password"
                  className="text-xs font-medium leading-[19.2px] text-text-secondary"
                >
                  Current Password
                </label>
                <input
                  id="delete-account-password"
                  type="password"
                  value={deletePassword}
                  onChange={(ev) => {
                    setDeletePassword(ev.target.value);
                    setDeleteError(null);
                  }}
                  className="input-field focus-visible:border-error"
                />
              </div>
            </div>

            {deleteError ? (
              <p className="mt-4 text-sm text-error" role="alert">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingAccount}
                className="btn-ghost h-10 cursor-pointer px-4 text-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={disableDeleteAccount}
                className="btn-ghost h-10 cursor-pointer justify-center border-error px-4 text-sm text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAccount ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
