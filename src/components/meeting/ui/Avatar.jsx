function Avatar({ name, large = false }) {
  const initials = (name || "Guest")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`
        rounded-full
        bg-gradient-to-br
        from-violet-500
        via-purple-600
        to-indigo-600
        flex
        items-center
        justify-center
        font-bold
        text-white
        shadow-xl
        ${
          large
            ? "h-32 w-32 text-5xl"
            : "h-12 w-12 text-lg"
        }
      `}
    >
      {initials}
    </div>
  );
}

export default Avatar;