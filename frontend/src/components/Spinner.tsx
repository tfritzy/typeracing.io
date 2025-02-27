export const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
    <div className="flex flex-col justify-center items-center space-y-4">
      <div className="w-9 h-9 border-2 border-base-700 border-t-transparent rounded-full animate-[spin_0.6s_linear_infinite]" />
    </div>
  </div>
);
