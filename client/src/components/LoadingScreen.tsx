export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-2xl font-black text-gray-700 mb-4" style={{ fontFamily: 'monospace' }}>
          LOADING...
        </div>
        <div className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>
          Please wait
        </div>
      </div>
    </div>
  );
}
