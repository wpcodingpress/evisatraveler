export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-violet-50">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-violet-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-violet-600 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading...</h2>
        <p className="text-slate-500">Please wait while we prepare your content</p>
      </div>
    </div>
  );
}
