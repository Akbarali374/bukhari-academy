export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative animate-pulse">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-gray-800 shadow-2xl flex items-center justify-center border-4 border-green-500 animate-bounce">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">BA</div>
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mt-1">BUKHARI</div>
                <div className="text-[10px] text-green-500 dark:text-green-500">ACADEMY</div>
              </div>
            </div>
            {/* Ruchka emoji */}
            <div className="absolute -bottom-2 -right-2 text-4xl animate-bounce">
              ✍️
            </div>
          </div>
        </div>

        {/* Ulanmoqda xabari */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Bukhari Academy
        </h2>
        <p className="text-lg text-green-600 dark:text-green-400 font-medium mb-6">
          Kundaligingizga xush kelibsiz! 📚
        </p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 font-medium">Ulanmoqda</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
