function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-900/90
        backdrop-blur-xl
        shadow-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export default GlassCard;