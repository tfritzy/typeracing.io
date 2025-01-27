export const Spinner = ({ text }: { text?: string }) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="flex flex-col justify-center items-center space-y-4">
      {text && <div className="text-base-500 text-2xl">{text}</div>}
      <div className="w-9 h-9 border-2 border-base-500 border-t-transparent rounded-full animate-[spin_0.6s_linear_infinite]" />
    </div>
  </div>
);
