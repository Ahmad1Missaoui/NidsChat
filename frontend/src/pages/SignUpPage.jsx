import React from 'react'
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { LockIcon, MailIcon, UserIcon, LoaderIcon, Calendar, MapPin, AtSignIcon, CheckCircleIcon, XCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";
import { useTranslation } from "react-i18next";

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    fullName: "", 
    username: "",
    email: "", 
    password: "",
    gender: "",
    birthday: "",
    country: ""
  });
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });
  const { signup, isSigningUp } = useAuthStore();
  const { t } = useTranslation();

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameStatus({ checking: false, available: null, message: "" });
        return;
      }
      
      setUsernameStatus({ checking: true, available: null, message: "" });
      
      try {
        const response = await axiosInstance.get(`/auth/check-username/${formData.username.toLowerCase()}`);
        setUsernameStatus({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: error.response?.data?.message || "Error checking username",
        });
      }
    };
    
    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(formData);
    if (result?.success) {
      // Redirect to login page after successful signup
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }
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
        to="/login"
        className="fixed top-6 left-6 z-50 flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-br from-white/5 via-white/[0.08] to-white/5 hover:from-white/10 hover:via-white/[0.15] hover:to-white/10 border border-white/20 hover:border-[#facc15]/60 rounded-2xl text-white hover:text-[#facc15] transition-all duration-500 ease-out group backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_40px_rgba(250,204,21,0.4)] hover:scale-105 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#facc15]/20 to-[#d4af37]/20 group-hover:from-[#facc15]/40 group-hover:to-[#d4af37]/40 flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg]">
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" />
        </div>
        <span className="font-semibold text-sm tracking-wide">{t('common.back_login')}</span>
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
                <h2 className="text-3xl sm:text-4xl font-bold text-white">{t('signup.title')}</h2>
                <p className="text-sm text-gray-300">{t('signup.subtitle')}</p>
              </div>

                {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* FULL NAME */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('signup.fullname_label')}</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('signup.fullname_placeholder')}
                    />
                  </div>
                </div>

                {/* USERNAME INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('signup.username_label')}</label>
                  <div className="relative">
                    <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                      className={`w-full bg-white/[0.03] border rounded-lg py-3 pl-11 pr-10 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:border-transparent backdrop-blur-sm transition-all ${
                        usernameStatus.available === true
                          ? 'border-green-500/50 focus:ring-green-500/50'
                          : usernameStatus.available === false
                          ? 'border-red-500/50 focus:ring-red-500/50'
                          : 'border-white/[0.08] focus:ring-[#89CFF0]/50'
                      }`}
                      placeholder={t('signup.username_placeholder')}
                    />
                    {usernameStatus.checking && (
                      <LoaderIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5 animate-spin" />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === true && (
                      <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === false && (
                      <XCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 w-5 h-5" />
                    )}
                  </div>
                  {usernameStatus.message && (
                    <p className={`text-xs ${
                      usernameStatus.available ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {usernameStatus.message}
                    </p>
                  )}
                </div>

                {/* EMAIL INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('signup.email_label')}</label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('signup.email_placeholder')}
                    />
                  </div>
                </div>

                {/* PASSWORD INPUT */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('signup.password_label')}</label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('signup.password_placeholder')}
                    />
                  </div>
                </div>

                {/* Optional Fields in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GENDER SELECT */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">{t('signup.gender_label')}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                    >
                      <option value="" className="bg-gray-900">{t('signup.gender_select')}</option>
                      <option value="male" className="bg-gray-900">{t('signup.gender_male')}</option>
                      <option value="female" className="bg-gray-900">{t('signup.gender_female')}</option>
                      <option value="other" className="bg-gray-900">{t('signup.gender_other')}</option>
                    </select>
                  </div>

                  {/* BIRTHDAY INPUT */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-200">{t('signup.birthday_label')}</label>
                    <input
                      type="date"
                      value={formData.birthday}
                      onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                    />
                  </div>
                </div>

                {/* COUNTRY INPUT - Full Width */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">{t('signup.country_label')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-[#89CFF0]/50 focus:border-transparent backdrop-blur-sm transition-all"
                      placeholder={t('signup.country_placeholder')}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  className="w-full bg-[#89CFF0]/20 border-2 border-[#89CFF0]/60 text-white rounded-lg py-3 font-semibold hover:bg-[#89CFF0]/30 hover:border-[#89CFF0] transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit" 
                  disabled={isSigningUp}
                >
                  {isSigningUp ? (
                    <LoaderIcon className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    t('signup.signup_button')
                  )}
                </button>
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
                {t('signup.google_button')}
              </button>

              <div className="text-center text-sm text-gray-300">
                {t('signup.have_account')}{" "}
                <Link to="/login" className="text-[#89CFF0] hover:text-[#6DB3E8] font-semibold transition-colors">
                  {t('signup.login_link')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
