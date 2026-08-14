function IconButton({
  children,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`
        h-12
        w-12
        rounded-full
        flex
        items-center
        justify-center
        transition-all
        duration-200
        hover:scale-105
        active:scale-95
        ${
          danger
            ? "bg-red-600 hover:bg-red-500"
            : "bg-zinc-800 hover:bg-zinc-700"
        }
      `}
    >
      {children}
    </button>
  );
}

export default IconButton;