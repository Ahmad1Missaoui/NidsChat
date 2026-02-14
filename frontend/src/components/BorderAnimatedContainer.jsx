function BorderAnimatedContainer({ children }) {
  return (
    <div className="w-full h-full [background:linear-gradient(135deg,#0b0b0f,#050507)_padding-box,conic-gradient(from_var(--border-angle),rgba(212,175,55,0.08),rgba(212,175,55,0.6),rgba(250,204,21,0.75),rgba(184,134,11,0.9),rgba(212,175,55,0.65),rgba(212,175,55,0.1))_border-box] rounded-2xl border border-transparent animate-border flex overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.16)]">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer; 