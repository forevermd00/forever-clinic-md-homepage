'use client';

import { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  registerUser,
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from '@/lib/auth/actions';

const inputClass =
  'h-[48px] w-full rounded-[6px] border border-[#efe5d9] bg-white pl-4 pr-4 text-[15px] text-[#2b2b2b] placeholder:text-[#bbb] focus:border-[#a83c44] focus:outline-none transition-colors';

export default function SignupPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    countryCode: '+82',
    phone: '',
  });
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Phone verification state
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneCode, setPhoneCode] = useState('');
  const [phoneTimer, setPhoneTimer] = useState(0);
  const [phoneSending, setPhoneSending] = useState(false);

  const update =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    setForm((prev) => ({ ...prev, phone: raw }));
  };

  const formatPhone = (digits: string) => {
    const d = digits.slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  };

  // Timer for phone verification
  useEffect(() => {
    if (phoneTimer <= 0) return;
    const interval = setInterval(() => {
      setPhoneTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phoneTimer]);

  const formatTimer = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const handleSendCode = async () => {
    if (!form.phone) {
      setErrors((prev) => ({ ...prev, phone: t('errorPhoneRequired') }));
      return;
    }
    setPhoneSending(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      delete next.phoneCode;
      return next;
    });

    try {
      const result = await sendPhoneVerificationCode(
        `${form.countryCode} ${form.phone}`,
      );
      if ('error' in result) {
        setErrors((prev) => ({ ...prev, phone: t('errorSmsFailed') }));
      } else {
        setPhoneSent(true);
        setPhoneTimer(300); // 5분
        setPhoneVerified(false);
        setPhoneCode('');
      }
    } catch {
      setErrors((prev) => ({ ...prev, phone: t('errorSmsFailed') }));
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!phoneCode) {
      setErrors((prev) => ({ ...prev, phoneCode: t('errorCodeRequired') }));
      return;
    }

    try {
      const result = await verifyPhoneCode(
        `${form.countryCode} ${form.phone}`,
        phoneCode,
      );
      if (result.success) {
        setPhoneVerified(true);
        setErrors((prev) => {
          const next = { ...prev };
          delete next.phoneCode;
          return next;
        });
      } else if ('error' in result) {
        if (result.error === 'expired') {
          setErrors((prev) => ({ ...prev, phoneCode: t('codeExpired') }));
        } else {
          setErrors((prev) => ({ ...prev, phoneCode: t('codeInvalid') }));
        }
      }
    } catch {
      setErrors((prev) => ({ ...prev, phoneCode: t('codeInvalid') }));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!form.email) newErrors.email = t('errorEmailRequired');
    if (!form.password) newErrors.password = t('errorPasswordRequired');
    else if (form.password.length < 8)
      newErrors.password = t('errorPasswordMinLength');
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = t('errorPasswordMismatch');
    if (!form.name) newErrors.name = t('errorNameRequired');
    if (!form.phone) newErrors.phone = t('errorPhoneRequired');
    if (!phoneVerified) {
      if (phoneSent) {
        newErrors.phoneCode = t('errorCodeRequired');
      } else {
        newErrors.phone = t('errorPhoneRequired');
      }
    }
    if (!privacyAgreed) newErrors.privacy = t('errorPrivacyRequired');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setServerError('');

    try {
      const fullPhone = `${form.countryCode} ${form.phone}`;
      const result = await registerUser({
        name: form.name,
        email: form.email,
        phone: fullPhone,
        password: form.password,
      });

      if ('error' in result && result.error) {
        setServerError(t('errorEmailExists'));
        setLoading(false);
        return;
      }

      // 가입 후 자동 로그인
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`/${locale}/auth/login`);
      } else {
        router.push(callbackUrl || `/${locale}`);
        router.refresh();
      }
    } catch {
      setServerError(t('errorEmailExists'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#faf8f5] px-5">
      <form
        onSubmit={handleSignup}
        className="mx-auto flex max-w-[640px] flex-col py-16 md:py-20"
      >
        {/* Header */}
        <h1 className="text-center text-[32px] font-bold text-[#2b2b2b]">
          {t('signupTitle')}
        </h1>
        <p className="mt-2 text-center text-[14px] text-[#999]">
          {t('signupSubtitle')}
        </p>

        {/* Fields */}
        <div className="mt-10 flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-email"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('email')} <span className="text-[#a83c44]">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={update('email')}
              className={inputClass}
            />
            {errors.email && (
              <p className="text-[13px] text-[#a83c44]">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-password"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('password')} <span className="text-[#a83c44]">*</span>
            </label>
            <input
              id="signup-password"
              type="password"
              placeholder={t('passwordMinLength')}
              value={form.password}
              onChange={update('password')}
              className={inputClass}
            />
            {errors.password && (
              <p className="text-[13px] text-[#a83c44]">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-confirm"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('confirmPassword')} <span className="text-[#a83c44]">*</span>
            </label>
            <input
              id="signup-confirm"
              type="password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              className={inputClass}
            />
            {errors.confirmPassword && (
              <p className="text-[13px] text-[#a83c44]">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-name"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('name')} <span className="text-[#a83c44]">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              placeholder={t('namePlaceholder')}
              value={form.name}
              onChange={update('name')}
              className={inputClass}
            />
            {errors.name && (
              <p className="text-[13px] text-[#a83c44]">{errors.name}</p>
            )}
          </div>

          {/* Phone with verification */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="signup-phone"
              className="text-[13px] font-medium text-[#2b2b2b]"
            >
              {t('phone')} <span className="text-[#a83c44]">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.countryCode}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, countryCode: e.target.value }))
                }
                disabled={phoneVerified}
                className={`h-[48px] w-[120px] shrink-0 rounded-[6px] border border-[#efe5d9] bg-white px-2 text-[14px] text-[#2b2b2b] focus:border-[#a83c44] focus:outline-none ${phoneVerified ? 'opacity-50' : ''}`}
              >
                <option value="+82">{'\u{1F1F0}\u{1F1F7}'} +82</option>
                <option value="+81">{'\u{1F1EF}\u{1F1F5}'} +81</option>
                <option value="+86">{'\u{1F1E8}\u{1F1F3}'} +86</option>
                <option value="+1">{'\u{1F1FA}\u{1F1F8}'} +1</option>
                <option value="+44">{'\u{1F1EC}\u{1F1E7}'} +44</option>
                <option value="+61">{'\u{1F1E6}\u{1F1FA}'} +61</option>
                <option value="+65">{'\u{1F1F8}\u{1F1EC}'} +65</option>
                <option value="+852">{'\u{1F1ED}\u{1F1F0}'} +852</option>
                <option value="+886">{'\u{1F1F9}\u{1F1FC}'} +886</option>
                <option value="+66">{'\u{1F1F9}\u{1F1ED}'} +66</option>
                <option value="+84">{'\u{1F1FB}\u{1F1F3}'} +84</option>
              </select>
              <input
                id="signup-phone"
                type="tel"
                inputMode="numeric"
                placeholder={t('phonePlaceholder')}
                value={formatPhone(form.phone)}
                onChange={handlePhoneChange}
                disabled={phoneVerified}
                className={`${inputClass} flex-1 ${phoneVerified ? 'opacity-50' : ''}`}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={phoneVerified || phoneSending}
                data-ga-id="auth-signup-send-code"
                className="h-[48px] shrink-0 rounded-[6px] bg-[#a83c44] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {phoneSending
                  ? '...'
                  : phoneSent
                    ? t('resendCode')
                    : t('sendCode')}
              </button>
            </div>
            {errors.phone && (
              <p className="text-[13px] text-[#a83c44]">{errors.phone}</p>
            )}
          </div>

          {/* Verification code input */}
          {phoneSent && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="signup-code"
                  className="text-[13px] font-medium text-[#2b2b2b]"
                >
                  {t('verificationCode')}
                  {phoneVerified && (
                    <span className="ml-2 text-green-600">
                      ✓ {t('codeVerified')}
                    </span>
                  )}
                </label>
                {!phoneVerified && phoneTimer > 0 && (
                  <span className="text-[13px] text-[#a83c44]">
                    {t('codeExpiry')} {formatTimer(phoneTimer)}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  id="signup-code"
                  type="text"
                  maxLength={6}
                  placeholder={t('verificationCodePlaceholder')}
                  value={phoneCode}
                  onChange={(e) =>
                    setPhoneCode(e.target.value.replace(/\D/g, ''))
                  }
                  disabled={phoneVerified}
                  className={`${inputClass} flex-1 ${phoneVerified ? 'opacity-50' : ''}`}
                />
                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={phoneVerified}
                  data-ga-id="auth-signup-verify-code"
                  className="h-[48px] shrink-0 rounded-[6px] bg-[#a83c44] px-4 text-[13px] font-medium text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('verify')}
                </button>
              </div>
              {errors.phoneCode && (
                <p className="text-[13px] text-[#a83c44]">{errors.phoneCode}</p>
              )}
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="mt-8 flex flex-col gap-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-[#a83c44]"
            />
            <span className="text-[13px] text-[#2b2b2b]">
              <Link
                href={`/${locale}/privacy`}
                data-ga-id="auth-signup-privacy-link"
                className="underline underline-offset-2"
              >
                {t('privacyAgree')}
              </Link>
              {t('privacyAgreeText')}{' '}
              <span className="text-[#a83c44]">({tCommon('required')})</span>
            </span>
          </label>
          {errors.privacy && (
            <p className="-mt-1 pl-6 text-[13px] text-[#a83c44]">
              {errors.privacy}
            </p>
          )}

          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={marketingAgreed}
              onChange={(e) => setMarketingAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-[#a83c44]"
            />
            <span className="text-[13px] text-[#2b2b2b]">
              {t('marketingAgree')}{' '}
              <span className="text-[#999]">({tCommon('optional')})</span>
            </span>
          </label>
        </div>

        {/* Server error */}
        {serverError && (
          <p className="mt-4 text-center text-[13px] text-[#a83c44]">
            {serverError}
          </p>
        )}

        {/* Signup button */}
        <button
          type="submit"
          disabled={loading}
          data-ga-id="auth-signup-submit"
          className="mt-8 h-[52px] w-full cursor-pointer rounded-[6px] bg-[#a83c44] text-[16px] font-bold text-white transition-colors hover:bg-[#8c2e38] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '...' : t('signupButton')}
        </button>

        {/* Footer link */}
        <p className="mt-8 text-center text-[13px] text-[#999]">
          {t('alreadyHaveAccount')}{' '}
          <Link
            href={`/${locale}/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            data-ga-id="auth-signup-to-login"
            className="font-medium text-[#a83c44] transition-colors hover:text-[#8c2e38]"
          >
            {tCommon('login')}
          </Link>
        </p>
      </form>
    </div>
  );
}
