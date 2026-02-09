import { useState, useEffect } from 'react'
import { Bot, Key, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { generateQuestionsWithAI } from '@/lib/testQuestions'
import type { TestLevel } from '@/types'
import toast from 'react-hot-toast'

export default function AdminAISettings() {
  const [apiKey, setApiKey] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [testLevel, setTestLevel] = useState<TestLevel>('beginner')
  const [testType, setTestType] = useState<'grammar' | 'reading' | 'listening'>('grammar')
  const [questionCount, setQuestionCount] = useState(10)

  useEffect(() => {
    // API key'ni localStorage'dan yuklash
    const stored = localStorage.getItem('openai_api_key')
    if (stored) {
      setApiKey(stored)
      setIsConfigured(true)
    }
  }, [])

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error('API key kiriting!')
      return
    }

    setSaving(true)
    try {
      localStorage.setItem('openai_api_key', apiKey.trim())
      setIsConfigured(true)
      toast.success('API key saqlandi!', {
        icon: '✅',
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold'
        }
      })
    } catch (error) {
      toast.error('Xatolik yuz berdi')
    } finally {
      setSaving(false)
    }
  }

  const generateQuestions = async () => {
    if (!isConfigured) {
      toast.error('Avval API key sozlang!')
      return
    }

    setGenerating(true)
    try {
      const questions = await generateQuestionsWithAI(testLevel, testType, questionCount, apiKey)
      toast.success(`${questions.length} ta savol yaratildi!`, {
        icon: '🤖',
        duration: 5000
      })
      console.log('AI yaratgan savollar:', questions)
    } catch (error: any) {
      toast.error(`Xato: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Bot className="w-7 h-7 text-purple-600" />
          AI Sozlamalari
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          OpenAI bilan test savollari yaratish
        </p>
      </div>

      {isConfigured && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">OpenAI API sozlangan! AI bilan savol yaratishingiz mumkin.</span>
          </div>
        </div>
      )}

      {/* API Key sozlash */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-purple-600" />
          OpenAI API Key
        </h2>

        {!isConfigured && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ OpenAI API key sozlanmagan. AI bilan savol yaratish uchun API key kiriting.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              OpenAI API key (https://platform.openai.com/api-keys)
            </p>
          </div>

          <button
            onClick={saveApiKey}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI bilan savol yaratish */}
      {isConfigured && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            AI bilan savol yaratish
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Test turi
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="grammar">Grammar</option>
                  <option value="reading">Reading</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level
                </label>
                <select
                  value={testLevel}
                  onChange={(e) => setTestLevel(e.target.value as TestLevel)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Savollar soni
                </label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  min="5"
                  max="50"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  AI savol yaratyapti...
                </>
              ) : (
                <>
                  <Bot className="w-5 h-5" />
                  AI bilan savol yaratish
                </>
              )}
            </button>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">AI haqida:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>AI avtomatik ravishda test savollari yaratadi</li>
                    <li>Savollar sifatli va professional bo'ladi</li>
                    <li>Har safar yangi savollar yaratiladi</li>
                    <li>OpenAI API pullik xizmat (https://openai.com/pricing)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yo'riqnoma */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          📖 Qanday sozlash?
        </h3>
        <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li className="flex gap-2">
            <span className="font-bold">1.</span>
            <span>https://platform.openai.com ga kiring</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">2.</span>
            <span>Sign up yoki Login qiling</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">3.</span>
            <span>API Keys → Create new secret key</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">4.</span>
            <span>API key'ni ko'chiring (sk- bilan boshlanadi)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">5.</span>
            <span>Yuqoridagi maydonga kiriting va "Saqlash" tugmasini bosing</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold">6.</span>
            <span>Endi AI bilan savol yaratishingiz mumkin!</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
