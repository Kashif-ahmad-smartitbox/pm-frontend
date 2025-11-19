const LoadingState = () => (
  <div className="min-h-screen bg-[#EFFFFA] flex items-center justify-center p-6">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-3 border-[#D9F3EE] border-t-[#1CC2B1] rounded-full animate-spin mx-auto"></div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#0E3554]">
          Loading Dashboard
        </h3>
        <p className="text-slate-600 text-sm">Preparing your workspace...</p>
      </div>
    </div>
  </div>
);

export default LoadingState;
