'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { sendPasswordResetCode, resetPassword } from '@/lib/auth/actions';

type Step = 'email' | 'code' | 'new-password' | 'success';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#efe5d9] bg-white pl-4 pr-4 text-[15px] text-[#2b2b2b] placeholder:text-[#bbb] focus:border-[#a83c44] focus:outline-none transition-colors';

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const t = useTranslations('auth');

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+82');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTimer = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleSend = async () => {
    if (!email) {
      setError(t('errorEmailRequired'));
      return;
    }
    if (!phone) {
      setError(t('errorPhoneRequired'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetCode(email, `${countryCode} ${phone}`);
      setStep('code');
      setTimer(300);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      setError(t('errorSmsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendPasswordResetCode(email, `${countryCode} ${phone}`);
      setTimer(300);
      setCode(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || '';
    }
    setCode(newCode);
    const nextEmpty = newCode.findIndex((c) => !c);
    codeRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerifyCode = async () => {
    const codeStr = code.join('');
    if (codeStr.length !== 6) {
      setError(t('errorCodeRequired'));
      return;
    }
    if (timer <= 0) {
      setError(t('codeExpired'));
      return;
    }
    setError('');
    setStep('new-password');
  };

  const handleResetPassword = async () => {
    if (!password) {
      setError(t('errorPasswordRequired'));
      return;
    }
    if (password.length < 8) {
      setError(t('errorPasswordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('errorPasswordMismatch'));
      return;
    }
    setError('');
    setLoading(true);

    try {
      const codeStr = code.join('');
      const result = await resetPassword(email, codeStr, password);
      if (result.success) {
        setStep('success');
      } else if ('error' in result) {
        if (result.error === 'expired') {
          setError(t('codeExpired'));
        } else {
          setError(t('codeInvalid'));
        }
      }
    } catch {
      setError(t('errorPasswordRequired'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] px-5">
      <div className="mx-auto flex max-w-[480px] flex-col py-16 md:py-20">
        {/* Step 1: Email + Phone input */}
        {step === 'email' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#2b2b2b]">
                {t('resetPasswordTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('resetPasswordSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-email"
                  className="text-[13px] font-medium text-[#2b2b2b]"
                >
                  {t('email')}
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="reset-phone"
                  className="text-[13px] font-medium text-[#2b2b2b]"
                >
                  {t('phone')}
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="h-[48px] w-[120px] shrink-0 rounded-[6px] border border-[#efe5d9] bg-white px-2 text-[14px] text-[#2b2b2b] focus:border-[#a83c44] focus:outline-none"
                  >
                    <option value="+82">🇰🇷 +82</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+81">🇯🇵 +81</option>
                    <option value="+86">🇨🇳 +86</option>
                  </select>
                  <input
                    id="reset-phone"
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^\d\-]/g, ''))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-[13px] text-[#a83c44]">{error}</p>}

            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              data-ga-id="auth-reset.send-code"
              className="h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '...' : t('sendVerificationCode')}
            </button>

            <Link
              href={`/${locale}/auth/login`}
              data-ga-id="auth-reset.back-to-login"
              className="text-center text-[13px] text-[#999] transition-colors hover:text-[#706263]"
            >
              {t('backToLogin')}
            </Link>
          </div>
        )}

        {/* Step 2: SMS Code input */}
        {step === 'code' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#2b2b2b]">
                {t('verificationCodeTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                <span className="font-medium text-[#2b2b2b]">
                  {countryCode} {phone}
                </span>
                {t('verificationCodeSubtitle')}
              </p>
            </div>

            <div
              className="flex justify-center gap-3"
              onPaste={handleCodePaste}
            >
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className="h-[56px] w-[48px] rounded-[6px] border border-[#efe5d9] bg-white text-center text-[20px] font-bold text-[#2b2b2b] transition-colors focus:border-[#a83c44] focus:outline-none"
                />
              ))}
            </div>

            <p className="text-center text-[13px] text-[#a83c44]">
              {t('codeExpiry')} {formatTimer(timer)}
            </p>

            {error && (
              <p className="text-center text-[13px] text-[#a83c44]">{error}</p>
            )}

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={loading}
              data-ga-id="auth-reset.verify-code"
              className="h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '...' : t('verify')}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              data-ga-id="auth-reset.resend-code"
              className="text-center text-[13px] font-medium text-[#a83c44] transition-colors hover:text-[#8c2e38]"
            >
              {t('resendCode')}
            </button>
          </div>
        )}

        {/* Step 3: New password */}
        {step === 'new-password' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-[28px] font-bold text-[#2b2b2b]">
                {t('newPasswordTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('newPasswordSubtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="new-password"
                  className="text-[13px] font-medium text-[#2b2b2b]"
                >
                  {t('newPassword')}
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder={t('passwordMinLength')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirm-new-password"
                  className="text-[13px] font-medium text-[#2b2b2b]"
                >
                  {t('confirmPassword')}
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <p className="text-center text-[13px] text-[#a83c44]">{error}</p>
            )}

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              data-ga-id="auth-reset.submit"
              className="h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '...' : t('completeChange')}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-[#a83c44]">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#a83c44"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <h1 className="text-[28px] font-bold text-[#2b2b2b]">
                {t('passwordChangedTitle')}
              </h1>
              <p className="mt-2 text-[14px] text-[#808080]">
                {t('passwordChangedSubtitle')}
              </p>
            </div>

            <Link
              href={`/${locale}/auth/login`}
              data-ga-id="auth-reset.success-to-login"
              className="flex h-[52px] w-full items-center justify-center rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38]"
            >
              {t('loginButton')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
