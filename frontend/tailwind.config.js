/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
     theme: {
        extend: {
      fontFamily: {
        brand: ["'Poppins'", "'Montserrat'", "Inter", "sans-serif"],
      },
      colors: {
        "nids-black": "#050507",
        "nids-black-2": "#0b0b0f",
        "nids-gold": "#d4af37",
        "nids-gold-bright": "#facc15",
        "nids-gold-dark": "#b8860b",
        "nids-gray": "#9ca3af",
      },
      backgroundImage: {
        "nids-radial":
          "radial-gradient(circle at 20% 20%, rgba(244,201,94,0.14), transparent 35%), radial-gradient(circle at 80% 0%, rgba(212,175,55,0.16), transparent 30%), radial-gradient(circle at 50% 80%, rgba(251,191,36,0.12), transparent 35%)",
        "nids-gold-gradient": "linear-gradient(135deg, #facc15, #d4af37, #b8860b)",
        "nids-gold-dark": "linear-gradient(135deg, #1a1200, #0b0b0f)",
      },
      boxShadow: {
        "nids-glow": "0 0 32px rgba(212,175,55,0.35)",
        "nids-inner": "inset 0 0 40px rgba(212,175,55,0.1)",
      },
            animation: {
        border: 'border 4s linear infinite',
        glow: 'glow 3s ease-in-out infinite',
            },
            keyframes: {
        border: {
                    to: { '--border-angle': '360deg' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(212,175,55,0.25)' },
          '50%': { boxShadow: '0 0 28px rgba(250,204,21,0.45)' },
        },
            }                      
        },
    },
  plugins: [
    
    require('daisyui'),
],
}