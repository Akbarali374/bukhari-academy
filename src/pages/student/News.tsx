import { useEffect, useState } from 'react'
import { getNews } from '@/lib/data'
import { useUnreadNews } from '@/hooks/useUnreadNews'
import type { News } from '@/types'
import { Calendar, User, Newspaper } from 'lucide-react'

export default function StudentNews() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const { markAllAsRead } = useUnreadNews()

  useEffect(() => {
    loadNews()
  }, [])

  async function loadNews() {
    const newsData = await getNews()
    setNews(newsData)
    setLoading(false)
    
    // Barcha yangilikni o'qilgan deb belgilash
    const newsIds = newsData.map(n => n.id)
    markAllAsRead(newsIds)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-primary-600 dark:text-primary-400" />
          Yangiliklar
        </h1>
        <p className="text-gray-500 dark:text-gray-400">O'quv markazi yangiliklari va e'lonlari</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((item) => (
            <article key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {item.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ml-4 flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.created_at).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="prose prose-gray dark:prose-invert max-w-none mb-4">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <User className="w-4 h-4" />
                  <span>Bukhari Academy</span>
                </div>
              </div>
            </article>
          ))}
          
          {news.length === 0 && (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">Hali yangiliklar yo'q</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Yangiliklar paydo bo'lganda bu yerda ko'rishingiz mumkin</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}