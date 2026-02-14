import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  MessageCircle, 
  Video, 
  Lock, 
  Zap, 
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Smartphone,
  Globe,
  Check
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { theme, setTheme } = useThemeStore();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsLangMenuOpen(false);
  };

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t('features.real_time_chat.title'),
      description: t('features.real_time_chat.desc')
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: t('features.video_calls.title'),
      description: t('features.video_calls.desc')
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: t('features.secure.title'),
      description: t('features.secure.desc')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('features.fast.title'),
      description: t('features.fast.desc')
    }
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'ar', label: 'العربية' }
  ];

  return (
    <div className="h-screen w-full bg-[#fcfcfc] dark:bg-[#0a0a0f] text-gray-900 dark:text-gray-100 overflow-y-auto overflow-x-hidden relative font-brand transition-colors duration-500" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 
         Background System 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Gradients */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-nids-gold/5 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ 
               backgroundImage: `linear-gradient(${theme === 'dark' ? '#333' : '#ccc'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#333' : '#ccc'} 1px, transparent 1px)`, 
               backgroundSize: '40px 40px' 
             }}>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="bg-white/80 dark:bg-[#121218]/80 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-nids-gold to-nids-gold-dark p-[2px]">
                      <img src="/logonids.avif" alt="Logo" className="w-full h-full rounded-full object-cover" />
                   </div>
                   <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                      NIDS <span className="text-nids-gold">Chat</span>
                   </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6">
                   {/* Language Switcher */}
                   <div className="relative">
                      <button 
                        onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-nids-gold transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Globe className="w-4 h-4" />
                        <span className="uppercase">{i18n.language}</span>
                      </button>

                      {isLangMenuOpen && (
                        <div className="absolute top-full mt-2 right-0 w-36 bg-white dark:bg-[#1a1a23] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200" style={{ zIndex: 100 }}>
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => changeLanguage(lang.code)}
                              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 ${i18n.language === lang.code ? 'text-nids-gold font-bold' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                              {lang.label}
                              {i18n.language === lang.code && <Check className="w-3 h-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                   </div>

                   {/* Theme Toggle */}
                   <button 
                     onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                     className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400"
                   >
                      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                   </button>

                   <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>

                   <Link to="/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-nids-gold">
                      {t('nav.login')}
                   </Link>
                   <Link to="/signup" className="bg-nids-gold hover:bg-nids-gold-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-nids-gold/20 transition-all hover:scale-105">
                      {t('nav.signup')}
                   </Link>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden flex items-center gap-3">
                    <button 
                        onClick={() => {
                           const nextLang = i18n.language === 'en' ? 'fr' : i18n.language === 'fr' ? 'ar' : 'en';
                           changeLanguage(nextLang);
                        }}
                        className="p-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold uppercase"
                     >
                        {i18n.language}
                     </button>
                    <button 
                     onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                     className="p-2 text-gray-500 dark:text-gray-400"
                   >
                      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                   </button>
                   <Link to="/signup" className="text-sm font-bold text-nids-gold">{t('nav.signup')}</Link>
                </div>
            </div>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-4 sm:px-6">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nids-gold/10 border border-nids-gold/20 text-nids-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>{t('hero.version_badge')}</span>
               </div>
               
               <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                  {t('hero.title_prefix')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-nids-gold via-[#facc15] to-nids-gold">{t('hero.title_highlight')}</span>
               </h1>
               
               <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {t('hero.description')}
               </p>
               
               <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Link to="/signup" className="flex items-center justify-center gap-2 bg-white dark:bg-white text-black px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-colors shadow-xl shadow-white/10">
                     {t('hero.cta_start')}
                     <ArrowRight className={`w-5 h-5 ${i18n.language === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                  <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                     {t('hero.cta_signin')}
                  </Link>
               </div>

               {/* Stats */}
               <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex gap-12 justify-center lg:justify-start">
                  <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">10M+</div>
                      <div className="text-sm text-gray-500">{t('hero.stats_users')}</div>
                  </div>
                  <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</div>
                      <div className="text-sm text-gray-500">{t('hero.stats_uptime')}</div>
                  </div>
               </div>
            </div>

            {/* UI Mockup */}
            <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-nids-gold/20 rounded-full blur-[120px] opacity-20 dark:opacity-20 animate-pulse"></div>
                
                {/* The "App" Window */}
                <div className="relative bg-white dark:bg-[#121218] border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700" dir="ltr">
                    
                    {/* Header */}
                    <div className="bg-gray-50 dark:bg-[#1a1a23] border-b border-gray-100 dark:border-white/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                              <div className="w-3 h-3 rounded-full bg-green-400"></div>
                           </div>
                           <div className="w-px h-4 bg-gray-200 dark:bg-white/10 mx-2"></div>
                           <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10"></div>
                               <div className="h-2 w-20 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                           </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="p-6 space-y-6 h-[400px]">
                        <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex-shrink-0"></div>
                           <div className="space-y-2">
                              <div className="bg-gray-100 dark:bg-[#20202a] p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 dark:text-gray-300">
                                 {t('mockup.msg1')}
                              </div>
                              <div className="bg-gray-100 dark:bg-[#20202a] p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 dark:text-gray-300 w-2/3">
                                 {t('mockup.msg2')}
                              </div>
                           </div>
                        </div>

                        <div className="flex gap-4 flex-row-reverse">
                           <div className="w-8 h-8 rounded-full bg-nids-gold/20 flex-shrink-0"></div>
                           <div className="bg-nids-gold text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-lg shadow-nids-gold/20">
                              {t('mockup.msg3')}
                           </div>
                        </div>
                        
                         <div className="flex gap-4">
                           <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex-shrink-0"></div>
                           <div className="bg-gray-100 dark:bg-[#20202a] p-3 rounded-2xl rounded-tl-none text-sm text-gray-600 dark:text-gray-300">
                               <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 rounded bg-gray-300 dark:bg-white/20 animate-pulse"></div>
                                  <div className="w-16 h-2 rounded bg-gray-300 dark:bg-white/20 animate-pulse"></div>
                                  <span className="text-xs text-gray-400 italic">{t('mockup.typing')}</span>
                               </div>
                           </div>
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-gray-50 dark:bg-[#1a1a23] border-t border-gray-100 dark:border-white/5">
                       <div className="bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 flex justify-between items-center">
                          <span className="text-gray-400 text-sm">{t('mockup.placeholder')}</span>
                          <div className="p-1.5 bg-nids-gold rounded-lg">
                             <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                       </div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50 dark:bg-[#121218]/50 border-y border-gray-100 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('features.title')}</h2>
               <p className="text-gray-500">{t('features.subtitle')}</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
               {features.map((feature, i) => (
                  <div key={i} className="p-6 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-nids-gold/50 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-nids-gold/10 flex items-center justify-center text-nids-gold mb-4">
                        {feature.icon}
                     </div>
                     <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-white/5">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-sm">{t('footer.rights')}</p>
            <div className="flex gap-6">
               <Globe className="w-5 h-5 text-gray-400 hover:text-nids-gold cursor-pointer" />
               <Smartphone className="w-5 h-5 text-gray-400 hover:text-nids-gold cursor-pointer" />
            </div>
         </div>
      </footer>
    </div>
  );
};

export default HomePage;
