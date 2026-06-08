import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { changePassword, deleteAccount } from '../api/users';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';
import { getInitial } from './../utils/getInitial';
import { getToastErrorMessage } from '../utils/toastErrorMessage';
import {
  ROUTES,
  LABELS,
  TOAST_MESSAGES,
  PASSWORD_MIN_LENGTH,
  SETTINGS_LABELS,
} from '@sonix/shared';

export default function SettingsPage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [syncedName, setSyncedName] = useState(user?.name ?? '');
  const [deleteState, setDeleteState] = useState({
    isOpen: false,
    password: '',
    deleting: false,
  });

  // Reset the field when the loaded user's name changes (e.g. after fetch/save).
  if ((user?.name ?? '') !== syncedName) {
    setSyncedName(user?.name ?? '');
    setDisplayName(user?.name ?? '');
  }

  const email = user?.email ?? '';
  const initial = getInitial(user?.name ?? '');

  const trimmedName = displayName.trim();
  const nameDirty = trimmedName !== (user?.name ?? '');
  const willUpdateName = nameDirty && trimmedName !== '';
  const disableUpdateName = savingName || !willUpdateName;

  const passwordsMismatch =
    Boolean(passwordForm.new) &&
    Boolean(passwordForm.confirm) &&
    passwordForm.new !== passwordForm.confirm;
  const newPasswordTooShort =
    Boolean(passwordForm.new) && passwordForm.new.length < PASSWORD_MIN_LENGTH;
  const passwordComplete =
    Boolean(passwordForm.current && passwordForm.new && passwordForm.confirm) &&
    !passwordsMismatch &&
    !newPasswordTooShort;
  const disableUpdatePassword = savingPassword || !passwordComplete;

  const disableDeleteAccount = deleteState.deleting || !deleteState.password;

  function validatePasswordMatch() {
    if (passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm) {
      toast.error(TOAST_MESSAGES.SETTINGS.PASSWORD_MISMATCH);
    }
  }

  function validateNewPassword() {
    if (passwordForm.new && passwordForm.new.length < PASSWORD_MIN_LENGTH) {
      toast.error(TOAST_MESSAGES.SETTINGS.PASSWORD_MIN_LENGTH);
    }
  }

  async function handleUpdateName() {
    if (disableUpdateName) return;

    setSavingName(true);
    try {
      await updateProfile({ name: trimmedName });
      toast.success(TOAST_MESSAGES.SETTINGS.NAME_UPDATED);
    } catch (err) {
      toast.error(getToastErrorMessage(err, TOAST_MESSAGES.SETTINGS.NAME_UPDATE_FAILED));
    } finally {
      setSavingName(false);
    }
  }

  async function handleUpdatePassword() {
    if (disableUpdatePassword) return;

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
      toast.success(TOAST_MESSAGES.SETTINGS.PASSWORD_UPDATED);
    } catch (err) {
      toast.error(getToastErrorMessage(err, TOAST_MESSAGES.SETTINGS.PASSWORD_UPDATE_FAILED));
    } finally {
      setSavingPassword(false);
    }
  }

  function openDeleteModal() {
    setDeleteState({
      isOpen: true,
      password: '',
      deleting: false,
    });
  }

  function closeDeleteModal() {
    if (deleteState.deleting) return;

    setDeleteState({
      isOpen: false,
      password: '',
      deleting: false,
    });
  }

  async function handleDeleteAccount() {
    if (disableDeleteAccount) return;

    setDeleteState((prev) => ({ ...prev, deleting: true }));

    try {
      await deleteAccount(deleteState.password);

      setDeleteState({
        isOpen: false,
        password: '',
        deleting: false,
      });
      await logout();
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(getToastErrorMessage(err, TOAST_MESSAGES.SETTINGS.DELETE_FAILED));
    } finally {
      setDeleteState((prev) => ({ ...prev, deleting: false }));
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-transparent text-text-primary">
      <NavBar />

      <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-8 px-6 pb-24 pt-10">
        <section className="flex w-full items-center gap-2">
          <BackButton fallback={ROUTES.EXPLORE} className="-ml-1" />
          <h1 className="text-[32px] font-semibold leading-[51.2px] text-text-primary">
            {LABELS.SETTINGS}
          </h1>
        </section>

        <section className="w-full rounded-xl border border-primary-border bg-surface p-12">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-text-primary">
                {SETTINGS_LABELS.PROFILE}
              </h2>

              <div className="flex flex-col gap-2">
                <div className="glass-card h-20 w-20 justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-[32px] font-semibold leading-8 text-text-primary">
                  {initial}
                </div>
                <p className="text-xs leading-[19.2px] text-text-secondary">
                  {SETTINGS_LABELS.AVATAR_HINT}
                </p>
              </div>

              <div className="flex w-full max-w-[480px] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="inline-flex items-center gap-1">
                    <label
                      htmlFor="display-name"
                      className="text-xs font-medium leading-[19.2px] text-text-secondary"
                    >
                      {SETTINGS_LABELS.DISPLAY_NAME}
                    </label>
                    <span className="group relative inline-flex items-center">
                      <button
                        type="button"
                        aria-describedby="display-name-tooltip"
                        aria-label={SETTINGS_LABELS.DISPLAY_NAME_INFO_ARIA}
                        className="inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-primary-border bg-surface text-[10px] leading-none text-text-secondary transition hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        {SETTINGS_LABELS.INFO_ICON}
                      </button>
                      <span
                        id="display-name-tooltip"
                        role="tooltip"
                        className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden w-56 -translate-x-1/2 rounded-lg border border-primary-border bg-surface px-3 py-2 text-xs leading-5 text-text-secondary shadow-lg group-hover:block group-focus-within:block"
                      >
                        {SETTINGS_LABELS.DISPLAY_NAME_TOOLTIP}
                      </span>
                    </span>
                  </div>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(ev) => {
                      setDisplayName(ev.target.value);
                    }}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email-address"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    {SETTINGS_LABELS.EMAIL_ADDRESS}
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

              <button
                type="button"
                onClick={handleUpdateName}
                disabled={disableUpdateName}
                className="btn-primary h-10 w-full max-w-60 cursor-pointer justify-center text-sm font-medium shadow-sm shadow-primary/30 transition hover:-translate-y-px hover:brightness-110 hover:shadow-md hover:shadow-primary/50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:text-text-secondary disabled:shadow-none"
              >
                {savingName ? SETTINGS_LABELS.UPDATING : SETTINGS_LABELS.UPDATE_NAME}
              </button>
            </div>

            <div className="flex flex-col gap-4 border-t border-primary-border pt-12">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-text-primary">
                {SETTINGS_LABELS.ACCOUNT}
              </h2>

              <h3 className="pt-2 text-lg font-medium leading-[25.2px] text-text-primary">
                {SETTINGS_LABELS.CHANGE_PASSWORD}
              </h3>

              <div className="flex w-full max-w-[480px] flex-col gap-4 pb-2">
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="current-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    {SETTINGS_LABELS.CURRENT_PASSWORD}
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordForm.current}
                    onChange={(ev) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        current: ev.target.value,
                      }));
                    }}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="new-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    {SETTINGS_LABELS.NEW_PASSWORD}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordForm.new}
                    onChange={(ev) => {
                      setPasswordForm((prev) => ({ ...prev, new: ev.target.value }));
                    }}
                    onBlur={() => {
                      validateNewPassword();
                      validatePasswordMatch();
                    }}
                    className="input-field focus-visible:border-primary"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs font-medium leading-[19.2px] text-text-secondary"
                  >
                    {SETTINGS_LABELS.CONFIRM_PASSWORD}
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(ev) => {
                      setPasswordForm((prev) => ({ ...prev, confirm: ev.target.value }));
                    }}
                    onBlur={validatePasswordMatch}
                    className="input-field focus-visible:border-primary"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={disableUpdatePassword}
                className="btn-primary h-10 w-full max-w-60 cursor-pointer justify-center text-sm font-medium shadow-sm shadow-primary/30 transition hover:-translate-y-px hover:brightness-110 hover:shadow-md hover:shadow-primary/50 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-primary/10 disabled:text-text-secondary disabled:shadow-none"
              >
                {savingPassword ? SETTINGS_LABELS.UPDATING : SETTINGS_LABELS.UPDATE_PASSWORD}
              </button>
            </div>

            <div className="flex flex-col gap-4 border-t border-primary-border pt-12">
              <h2 className="text-2xl font-semibold leading-[31.2px] text-text-primary">
                {SETTINGS_LABELS.DANGER_ZONE}
              </h2>

              <div className="flex flex-col gap-4 rounded-xl border border-error/40 bg-error/5 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-medium leading-[25.2px] text-text-primary">
                    {SETTINGS_LABELS.DELETE_CARD_TITLE}
                  </h3>
                  <p className="text-xs leading-[19.2px] text-text-secondary">
                    {SETTINGS_LABELS.DELETE_CARD_DESC}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="btn-ghost h-10 shrink-0 cursor-pointer justify-center border-error px-5 text-sm text-error transition hover:bg-error/10"
                >
                  {SETTINGS_LABELS.DELETE_ACCOUNT}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {deleteState.isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div className="w-full max-w-md rounded-xl border border-primary-border bg-surface p-6">
            <h3 id="delete-account-title" className="text-xl font-semibold text-text-primary">
              {SETTINGS_LABELS.DELETE_ACCOUNT}
            </h3>
            <p className="mt-2 text-sm text-text-secondary">{SETTINGS_LABELS.DELETE_MODAL_DESC}</p>

            <div className="mt-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="delete-account-password"
                  className="text-xs font-medium leading-[19.2px] text-text-secondary"
                >
                  {SETTINGS_LABELS.CURRENT_PASSWORD}
                </label>
                <input
                  id="delete-account-password"
                  type="password"
                  value={deleteState.password}
                  onChange={(ev) => {
                    setDeleteState((prev) => ({
                      ...prev,
                      password: ev.target.value,
                    }));
                  }}
                  className="input-field focus-visible:border-error"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleteState.deleting}
                className="btn-ghost h-10 cursor-pointer px-4 text-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {SETTINGS_LABELS.CANCEL}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={disableDeleteAccount}
                className="btn-ghost h-10 cursor-pointer justify-center border-error px-4 text-sm text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteState.deleting ? SETTINGS_LABELS.DELETING : SETTINGS_LABELS.DELETE_ACCOUNT}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
