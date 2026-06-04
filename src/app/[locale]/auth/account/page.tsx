'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { changePassword, deleteAccount } from '@/lib/auth/actions';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#efe5d9] bg-white pl-4 pr-4 text-[15px] text-[#2b2b2b] placeholder:text-[#bbb] focus:border-[#a83c44] focus:outline-none transition-colors';

export default function AccountPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (status === 'loading') return null;
  if (!session?.user) {
    router.push(`/${locale}/auth/login`);
    return null;
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword) {
      setPwError(t('errorCurrentPasswordRequired'));
      return;
    }
    if (!newPassword) {
      setPwError(t('errorPasswordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      setPwError(t('errorPasswordMinLength'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError(t('errorPasswordMismatch'));
      return;
    }

    setPwLoading(true);
    try {
      const result = await changePassword(
        session.user.id as string,
        currentPassword,
        newPassword,
      );
      if (result.success) {
        setPwSuccess(t('passwordChangeSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else if ('error' in result) {
        if (result.error === 'wrong_password') {
          setPwError(t('errorCurrentPasswordWrong'));
        } else {
          setPwError(t('errorPasswordRequired'));
        }
      }
    } catch {
      setPwError(t('errorPasswordRequired'));
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError(t('errorPasswordRequired'));
      return;
    }

    setDeleteLoading(true);
    setDeleteError('');

    try {
      const result = await deleteAccount(
        session.user.id as string,
        deletePassword,
      );
      if (result.success) {
        await signOut({ redirect: false });
        router.push(`/${locale}`);
        router.refresh();
      } else if ('error' in result) {
        if (result.error === 'wrong_password') {
          setDeleteError(t('errorCurrentPasswordWrong'));
        } else if (result.error === 'db_error') {
          setDeleteError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          setDeleteError(t('errorPasswordRequired'));
        }
      }
    } catch (err) {
      console.error('[deleteAccount] unexpected error:', err);
      setDeleteError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] px-5">
      <div className="mx-auto max-w-[640px] py-16 md:py-20">
        <h1 className="text-center text-[32px] font-bold text-[#2b2b2b]">
          {t('accountSettings')}
        </h1>
        <p className="mt-2 text-center text-[14px] text-[#999]">
          {session.user.email}
        </p>

        {/* Password Change Section */}
        <form onSubmit={handleChangePassword} className="mt-12">
          <h2 className="text-[18px] font-bold text-[#2b2b2b]">
            {t('changePassword')}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                {t('currentPassword')}
              </label>
              <input
                type="password"
                placeholder={t('currentPasswordPlaceholder')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                {t('newPassword')}
              </label>
              <input
                type="password"
                placeholder={t('passwordMinLength')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[#2b2b2b]">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {pwError && (
            <p className="mt-3 text-[13px] text-[#a83c44]">{pwError}</p>
          )}
          {pwSuccess && (
            <p className="mt-3 text-[13px] font-medium text-green-600">
              {pwSuccess}
            </p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            data-ga-id="account-change-password-submit"
            className="mt-6 h-[48px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[15px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pwLoading ? '...' : t('changePassword')}
          </button>
        </form>

        {/* Logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          data-ga-id="account-logout"
          className="mt-10 h-[48px] w-full cursor-pointer rounded-[6px] border border-[#efe5d9] bg-white text-[15px] font-medium text-[#706263] transition-colors hover:bg-neutral-50"
        >
          {t('logout')}
        </button>

        {/* Divider */}
        <div className="my-12 h-px bg-[#efe5d9]" />

        {/* Delete Account Section */}
        <div>
          <h2 className="text-[18px] font-bold text-[#a83c44]">
            {t('deleteAccount')}
          </h2>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              data-ga-id="account-delete-show-confirm"
              className="mt-4 h-[48px] w-full cursor-pointer rounded-[6px] border border-[#a83c44] bg-transparent text-[15px] font-bold text-[#a83c44] transition-colors hover:bg-[#a83c44] hover:text-white"
            >
              {t('deleteAccountButton')}
            </button>
          ) : (
            <div className="mt-4 flex flex-col gap-4 rounded-[8px] border border-[#efe5d9] bg-white p-6">
              <p className="text-[14px] text-[#2b2b2b]">
                {t('deleteAccountConfirm')}
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[#2b2b2b]">
                  {t('deleteAccountPassword')}
                </label>
                <input
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              {deleteError && (
                <p className="text-[13px] text-[#a83c44]">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }}
                  data-ga-id="account-delete-cancel"
                  className="h-[48px] flex-1 cursor-pointer rounded-[6px] border border-[#efe5d9] bg-white text-[15px] font-medium text-[#706263] transition-colors hover:bg-neutral-50"
                >
                  {tCommon('close')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  data-ga-id="account-delete-confirm"
                  className="h-[48px] flex-1 cursor-pointer rounded-[6px] bg-[#a83c44] text-[15px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading ? '...' : t('deleteAccountButton')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
