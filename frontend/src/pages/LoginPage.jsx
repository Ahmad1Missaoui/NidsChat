import React from 'react'
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MailIcon, LoaderIcon, LockIcon, AtSignIcon, ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

function LoginPage() {
  const [formData, setFormData] = useState({ emailOrUsername: "", password: "" });
  const [showResend, setShowResend] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { login, isLoggingIn, resendVerification } = useAuthStore();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    
    if (result?.emailNotVerified) {
      setShowResend(true);
      setUserEmail(result.email);
    } else {
      setShowResend(false);
    }
  };

  const handleResendVerification = async () => {
    await resendVerification(userEmail);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-20 text-white overflow-y-auto">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('/loginbg.jpg')` }}
      ></div>
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/10 z-0"></div>

      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-br from-white/5 via-white/[0.08] to-white/5 hover:from-white/10 hover:via-white/[0.15] hover:to-white/10 border border-white/20 hover:border-[#facc15]/60 rounded-2xl text-white hover:text-[#facc15] transition-all duration-500 ease-out group backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#facc15]/20 to-[#d4af37]/20 group-hover:from-[#facc15]/40 group-hover:to-[#d4af37]/40 flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]">
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </div>
        <span className="font-semibold text-sm tracking-wide">{t('common.back_home')}</span>
      </Link>

      <div className="relative w-full max-w-md my-auto z-10">
        <div className="w-full bg-transparent backdrop-blur-sm border border-white/[0.03] rounded-2xl shadow-2xl">
          <div className="p-8 sm:p-10">
            <div className="w-full space-y-6">
              {/* HEADING TEXT */}
              <div className="space-y-3 text-center">
                <div className="flex justify-center mb-4">
                  <img src="/logonids.avif" alt="NIDS Logo" className="w-16 h-16 rounded-full shadow-lg" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('login.title')}</h2>
                <p className="text-sm text-gray-300">{t('login.subtitle')}</p>
              </div>

                {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* EMAIL OR USERNAME INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('login.email_username_label')}</label>
                  <div className="relative">
                    <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.emailOrUsername}
                      onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('login.email_username_placeholder')}
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('login.password_label')}</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('login.password_placeholder')}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  className="w-full bg-[#89CFF0]/20 border-2 border-[#89CFF0]/60 text-white rounded-lg py-3 font-semibold hover:bg-[#89CFF0]/30 hover:border-[#89CFF0] transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit" 
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    t('login.signin_button')
                  )}
                </button>

                {/* Resend Verification Button */}
                {showResend && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-sm mb-3 text-center">
                      ⚠️ Your email is not verified. Please check your inbox.
                    </p>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="w-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-100 rounded-lg py-2 font-medium hover:bg-yellow-500/30 transition-all duration-200"
                    >
                      Resend Verification Email
                    </button>
                  </div>
                )}
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">{t('common.or')}</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                className="w-full bg-white/5 border border-white/10 text-white rounded-lg py-3 font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-3"
                onClick={() => {
                  // Google OAuth will be implemented here
                  alert("Google OAuth integration coming soon! Please add your Google Client ID in the frontend.");
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('login.google_button')}
              </button>

              <div className="text-center text-sm text-gray-300">
                {t('login.no_account')}{" "}
                <Link to="/signup" className="text-[#89CFF0] hover:text-[#6DB3E8] font-semibold transition-colors">
                  {t('login.signup_link')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;