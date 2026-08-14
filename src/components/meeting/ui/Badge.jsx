function Badge({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-semibold">
      {children}
    </span>
  );
}

export default Badge;