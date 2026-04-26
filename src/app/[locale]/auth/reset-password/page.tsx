'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Step = 'email' | 'sent' | 'new-password' | 'success';

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations('auth');

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSendEmail = () => {
    if (!email) {
      setError(t('errorEmailRequired'));
      return;
    }
    setError('');
    setStep('sent');
  };

  const handleResetPassword = () => {
    if (!password) {
      setError(t('errorPasswordRequired'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }
    if (password.length < 8) {
      setError(t('errorPasswordMinLength'));
      return;
    }
    setError('');
    setStep('success');
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#faf8f5] px-5">
      <div className="w-full max-w-[480px] rounded-[12px] bg-white p-8 shadow-[0px_4px_12px_rgba(43,43,43,0.08)] md:p-10">
        {/* Step 1: Email input */}
        {step === 'email' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-[#2b2b2b]">
                {t('resetPasswordTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('resetPasswordSubtitle')}
              </p>
            </div>

            <Input
              label={t('email')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error || undefined}
            />

            <Button size="lg" className="w-full" onClick={handleSendEmail}>
              {t('sendVerificationEmail')}
            </Button>
          </div>
        )}

        {/* Step 2: Email sent confirmation */}
        {step === 'sent' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-forever-ivory flex size-16 items-center justify-center rounded-full">
              <span className="text-[28px]">&#9993;</span>
            </div>

            <div>
              <h1 className="text-[24px] font-bold text-[#2b2b2b]">
                {t('emailSentTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                <span className="font-medium text-[#2b2b2b]">{email}</span>
                {t('emailSentDescription')}
              </p>
            </div>

            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => setStep('new-password')}
            >
              {t('openResetLink')}
            </Button>
          </div>
        )}

        {/* Step 3: New password input */}
        {step === 'new-password' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-[24px] font-bold text-[#2b2b2b]">
                {t('newPasswordTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('newPasswordSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label={t('newPassword')}
                type="password"
                placeholder={t('passwordMinLength')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                label={t('confirmPassword')}
                type="password"
                placeholder={t('confirmPasswordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={error || undefined}
              />
            </div>

            <Button size="lg" className="w-full" onClick={handleResetPassword}>
              {t('changePassword')}
            </Button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="bg-forever-ivory flex size-16 items-center justify-center rounded-full">
              <span className="text-[28px]">&#10003;</span>
            </div>

            <div>
              <h1 className="text-[24px] font-bold text-[#2b2b2b]">
                {t('passwordChangedTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('passwordChangedSubtitle')}
              </p>
            </div>

            <Link href={`/${locale}/auth/login`} className="w-full">
              <Button size="lg" className="w-full">
                {t('loginButton')}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
