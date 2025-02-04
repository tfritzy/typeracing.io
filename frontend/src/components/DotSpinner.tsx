export function DotSpinner() {
  return (
    <div className="flex flex-row space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-accent rounded-full animate-[bounce_1s_ease-in-out_infinite]"
          style={{
            animation: "bounce 1s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
