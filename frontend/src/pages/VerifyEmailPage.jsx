import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
import { CheckCircleIcon, XCircleIcon, LoaderIcon, MailIcon, ArrowLeftIcon, SparklesIcon } from "lucide-react";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    const verify = async () => {
      const result = await verifyEmail(token);
      
      if (result.success) {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to your chats...");
        // Redirect to chats after 2 seconds
        setTimeout(() => {
          navigate("/chats");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(result.message || "Verification failed");
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-6 sm:py-10 text-white overflow-hidden">
      {/* Back Button - Only show on error */}
      {status === "error" && (
        <Link
          to="/login"
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#facc15]/10 to-[#d4af37]/10 hover:from-[#facc15]/20 hover:to-[#d4af37]/20 border border-[#facc15]/30 hover:border-[#facc15]/50 rounded-xl text-[#facc15] transition-all duration-300 group backdrop-blur-sm shadow-lg hover:shadow-[#facc15]/20"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Login</span>
        </Link>
      )}
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/loginbg.jpg')` }}
      ></div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="w-full bg-transparent backdrop-blur-sm border border-white/[0.03] rounded-2xl shadow-2xl">
          <div className="p-8 sm:p-10">
            <div className="w-full space-y-6">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img src="/logonids.avif" alt="NIDS Logo" className="w-20 h-20 rounded-full shadow-lg ring-4 ring-[#facc15]/20" />
              </div>

              {/* Verifying State */}
              {status === "verifying" && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-[#89CFF0]/20 to-[#facc15]/20 rounded-full flex items-center justify-center border-2 border-[#89CFF0]/30">
                    <LoaderIcon className="w-10 h-10 text-[#89CFF0] animate-spin" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Verifying Your Email
                  </h2>
                  <p className="text-gray-300">
                    Please wait while we verify your email address...
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-[#facc15]">
                    <SparklesIcon className="w-4 h-4" />
                    <span>This will only take a moment</span>
                  </div>
                </div>
              )}

              {/* Success State */}
              {status === "success" && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 animate-pulse">
                    <CheckCircleIcon className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Email Verified! ✨
                  </h2>
                  <p className="text-gray-300">{message}</p>
                  <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                      🎉 Welcome to NIDS! You're all set.
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {status === "error" && (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border-2 border-red-500/50">
                    <XCircleIcon className="w-10 h-10 text-red-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Verification Failed
                  </h2>
                  <p className="text-gray-300">{message}</p>
                  
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ The verification link may have expired or is invalid.
                    </p>
                  </div>

                  <div className="space-y-3 mt-6">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-gradient-to-r from-[#89CFF0]/20 to-[#facc15]/20 border-2 border-[#89CFF0]/60 text-white rounded-lg py-3 font-semibold hover:from-[#89CFF0]/30 hover:to-[#facc15]/30 hover:border-[#facc15] transition-all duration-300 backdrop-blur-sm"
                    >
                      Go to Login
                    </button>
                    <button
                      onClick={() => navigate("/signup")}
                      className="w-full bg-white/[0.03] border border-white/[0.08] text-gray-300 rounded-lg py-3 font-semibold hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
                    >
                      Create New Account
                    </button>
                  </div>
                </div>
              )}

              {/* Footer Info */}
              {status !== "error" && (
                <div className="mt-6 flex items-center justify-center text-sm text-gray-400 border-t border-white/10 pt-4">
                  <MailIcon className="w-4 h-4 mr-2 text-[#facc15]" />
                  <span>Secure Email Verification</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* NIDS Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">Powered by <span className="text-[#facc15] font-semibold">NIDS</span></p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
