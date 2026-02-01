import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getStudentsByGroup, createComment, getCommentsByStudent, commentSuggestions } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import type { Profile, Comment } from '@/types'
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeacherComments() {
  const { studentId } = useParams<{ studentId: string }>()
  const { user } = useAuth()
  const [student, setStudent] = useState<Profile | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'positive' | 'negative' | 'neutral'>('positive')
  const [submitting, setSubmitting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (!studentId) return
    
    // Find student from all groups (simplified for demo)
    // In real app, you'd have a direct getStudent function
    const loadStudent = async () => {
      // This is a simplified approach - in real app you'd have better student lookup
      setLoading(false)
    }
    
    const loadComments = async () => {
      try {
        const studentComments = await getCommentsByStudent(studentId)
        setComments(studentComments)
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }

    loadStudent()
    loadComments()
  }, [studentId])

  const handleSuggestionClick = (suggestion: string) => {
    setNewComment(suggestion)
    setShowSuggestions(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !user?.id || !newComment.trim()) return

    setSubmitting(true)
    try {
      const comment = await createComment(studentId, user.id, newComment.trim(), commentType)
      setComments([comment, ...comments])
      setNewComment('')
      toast.success('Izoh qo\'shildi')
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    }
    setSubmitting(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'positive': return <ThumbsUp className="w-4 h-4 text-green-500" />
      case 'negative': return <ThumbsDown className="w-4 h-4 text-red-500" />
      default: return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      case 'negative': return 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">O'quvchi izohlari</h1>
        <p className="text-gray-500 dark:text-gray-400">O'quvchi faoliyati haqida izohlar qo'shing</p>
      </div>

      {/* Comment Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCommentType('positive')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                commentType === 'positive' 
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Ijobiy
            </button>
            <button
              type="button"
              onClick={() => setCommentType('negative')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                commentType === 'negative' 
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              Salbiy
            </button>
            <button
              type="button"
              onClick={() => setCommentType('neutral')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                commentType === 'neutral' 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Minus className="w-4 h-4" />
              Neytral
            </button>
          </div>

          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Izoh yozing..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="absolute top-2 right-2 px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/60"
            >
              Tavsiyalar
            </button>
          </div>

          {showSuggestions && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {commentType === 'positive' ? 'Ijobiy' : commentType === 'negative' ? 'Salbiy' : 'Neytral'} izohlar:
              </h4>
              <div className="flex flex-wrap gap-2">
                {commentSuggestions[commentType].map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Izohlar tarixi
        </h2>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Hali izohlar yo'q
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(comment.type)}`}>
                  {getTypeIcon(comment.type)}
                  {comment.type === 'positive' ? 'Ijobiy' : comment.type === 'negative' ? 'Salbiy' : 'Neytral'}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString('uz-UZ')}
                </span>
              </div>
              <p className="text-gray-900 dark:text-white">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}