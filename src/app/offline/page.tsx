"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-pink-50 dark:bg-zinc-900 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="text-6xl">📡</div>
        <h1 className="text-2xl font-bold text-pink-700 dark:text-pink-300">
          离线模式
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          当前没有网络连接，请检查网络后重试。
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
