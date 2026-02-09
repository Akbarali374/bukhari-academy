import { useState } from 'react'
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react'
import { getQuestionsByLevelAndType, calculateTestScore } from '@/lib/testQuestions'
import type { TestLevel, TestQuestion } from '@/types'
import toast from 'react-hot-toast'

export default function StudentTests() {
  const [selectedLevel, setSelectedLevel] = useState<TestLevel | null>(null)
  const [selectedType, setSelectedType] = useState<'grammar' | 'reading' | 'listening'>('grammar')
  const [testStarted, setTestStarted] = useState(false)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[][]>([])
  const [timeLeft, setTimeLeft] = useState(1800) // 30 daqiqa
  const [testCompleted, setTestCompleted] = useState(false)
  const [result, setResult] = useState<any>(null)

  const startTest = () => {
    if (!selectedLevel) {
      toast.error('Level tanlang!')
      return
    }
    
    const qs = getQuestionsByLevelAndType(selectedLevel, selectedType, 30)
    if (qs.length === 0) {
      toast.error('Savollar topilmadi!')
      return
    }
    
    setQuestions(qs)
    setAnswers(new Array(qs.length).fill([]))
    setTestStarted(true)
    setCurrentQuestion(0)
    setTimeLeft(1800)
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          finishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = [optionIndex]
    setAnswers(newAnswers)
  }

  const finishTest = () => {
    const res = calculateTestScore(questions, answers)
    setResult(res)
    setTestCompleted(true)
    toast.success(`Test tugadi! Natija: ${res.score}/100`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (testCompleted && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test yakunlandi!
          </h1>
          <div className="text-6xl font-bold text-primary-600 my-6">
            {result.score}/100
          </div>
          <div className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            {result.grade}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">To'g'ri javoblar</div>
              <div className="text-2xl font-bold text-green-600">{result.correct}/{result.total}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Foiz</div>
              <div className="text-2xl font-bold text-blue-600">{result.percentage.toFixed(1)}%</div>
            </div>
          </div>
          <button
            onClick={() => {
              setTestStarted(false)
              setTestCompleted(false)
              setSelectedLevel(null)
            }}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Yangi test boshlash
          </button>
        </div>
      </div>
    )
  }

  if (testStarted) {
    const q = questions[currentQuestion]
    return (
      <div className="max-w-4xl mx-auto">
        {/* Timer va Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Savol {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Savol */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {q.question}
          </h2>
          <div className="space-y-3">
            {q.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(currentQuestion, i)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion]?.includes(i)
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  {String.fromCharCode(65 + i)}. {option}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            {currentQuestion > 0 && (
              <button
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Orqaga
              </button>
            )}
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                className="flex-1 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Keyingi
              </button>
            ) : (
              <button
                onClick={finishTest}
                className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Testni yakunlash
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Testlar</h1>
      
      {/* Test turi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test turini tanlang</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: 'grammar' as const, label: 'Grammar', icon: BookOpen },
            { type: 'reading' as const, label: 'Reading', icon: BookOpen }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === type
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Level tanlash */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Darajangizni tanlang</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { level: 'beginner' as TestLevel, label: 'Beginner', desc: 'Boshlang\'ich' },
            { level: 'intermediate' as TestLevel, label: 'Intermediate', desc: 'O\'rta' },
            { level: 'advanced' as TestLevel, label: 'Advanced', desc: 'Yuqori' }
          ].map(({ level, label, desc }) => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedLevel === level
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary-600" />
              <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={startTest}
        disabled={!selectedLevel}
        className="w-full py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
      >
        Testni boshlash (30 savol, 30 daqiqa)
      </button>
    </div>
  )
}
