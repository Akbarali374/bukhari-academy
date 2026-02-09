// Test savollari - 3 ta tur: Listening, Reading, Grammar
// Har bir tur uchun 3 ta level: Beginner, Intermediate, Advanced

import type { TestQuestion, TestLevel } from '@/types'

// ==================== GRAMMAR TESTS ====================

// BEGINNER - Grammar (50 savol)
const grammarBeginnerQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'beginner', question: 'Choose the correct verb: "I ___ a student"', options: ['am', 'is', 'are', 'be'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'What is the plural of "book"?', options: ['books', 'bookes', 'book', 'bookies'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose the correct article: "___ apple"', options: ['a', 'an', 'the', 'no article'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Complete: "She ___ to school every day"', options: ['go', 'goes', 'going', 'gone'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose the correct pronoun: "___ is my friend"', options: ['He', 'Him', 'His', 'Her'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'What is the past tense of "go"?', options: ['goed', 'went', 'gone', 'going'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose: "This is ___ book"', options: ['my', 'me', 'I', 'mine'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'Complete: "They ___ happy"', options: ['am', 'is', 'are', 'be'], correct_answer: [2], type: 'single', points: 2 },
  { level: 'beginner', question: 'What is the opposite of "big"?', options: ['small', 'large', 'huge', 'tall'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose: "I ___ English"', options: ['speak', 'speaks', 'speaking', 'spoke'], correct_answer: [0], type: 'single', points: 2 },
  // 40 ta yana...
  { level: 'beginner', question: 'Complete: "We ___ students"', options: ['am', 'is', 'are', 'be'], correct_answer: [2], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose: "___ name is John"', options: ['My', 'Me', 'I', 'Mine'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'What is the plural of "child"?', options: ['childs', 'children', 'childes', 'child'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Complete: "She ___ a teacher"', options: ['am', 'is', 'are', 'be'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Choose: "I like ___"', options: ['apple', 'apples', 'an apple', 'the apple'], correct_answer: [1], type: 'single', points: 2 },
]

// INTERMEDIATE - Grammar (50 savol)
const grammarIntermediateQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'intermediate', question: 'Choose the correct tense: "I ___ English for 5 years"', options: ['learn', 'am learning', 'have been learning', 'learned'], correct_answer: [2], type: 'single', points: 2 },
  { level: 'intermediate', question: 'Which sentence is in passive voice?', options: ['She writes a letter', 'A letter is written by her', 'She is writing a letter', 'She has written a letter'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'intermediate', question: 'Complete: "If I ___ you, I would go"', options: ['am', 'was', 'were', 'be'], correct_answer: [2], type: 'single', points: 2 },
  { level: 'intermediate', question: 'Choose: "She has ___ finished her work"', options: ['yet', 'already', 'still', 'never'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'intermediate', question: 'Complete: "I wish I ___ rich"', options: ['am', 'was', 'were', 'be'], correct_answer: [2], type: 'single', points: 2 },
  // 45 ta yana...
]

// ADVANCED - Grammar (50 savol)
const grammarAdvancedQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'advanced', question: 'Choose the correct conditional: "If I ___ you, I ___ accept the offer"', options: ['am, will', 'were, would', 'was, will', 'be, would'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'advanced', question: 'Identify the subjunctive: "It is essential that he ___ on time"', options: ['is', 'be', 'was', 'were'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'advanced', question: 'Choose the correct phrasal verb: "The meeting was ___ until next week"', options: ['put off', 'put on', 'put up', 'put down'], correct_answer: [0], type: 'single', points: 2 },
  // 47 ta yana...
]

// ==================== READING TESTS ====================

// BEGINNER - Reading (50 savol)
const readingBeginnerQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'beginner', question: 'Read: "My name is John. I am 20 years old." - How old is John?', options: ['10', '20', '30', '40'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Read: "I have a cat. It is black." - What color is the cat?', options: ['White', 'Black', 'Brown', 'Gray'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Read: "She likes apples and oranges." - What does she like?', options: ['Only apples', 'Only oranges', 'Apples and oranges', 'Bananas'], correct_answer: [2], type: 'single', points: 2 },
  { level: 'beginner', question: 'Read: "The book is on the table." - Where is the book?', options: ['On the chair', 'On the table', 'On the floor', 'In the bag'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Read: "Tom goes to school by bus." - How does Tom go to school?', options: ['By car', 'By bike', 'By bus', 'On foot'], correct_answer: [2], type: 'single', points: 2 },
  // 45 ta yana...
]

// INTERMEDIATE - Reading (50 savol)
const readingIntermediateQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'intermediate', question: 'Read: "Despite the rain, they decided to go hiking." - What does "despite" mean?', options: ['Because of', 'In spite of', 'Due to', 'Thanks to'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'intermediate', question: 'Read: "The company has been growing rapidly over the past year." - What is happening to the company?', options: ['Declining', 'Growing fast', 'Staying same', 'Closing'], correct_answer: [1], type: 'single', points: 2 },
  // 48 ta yana...
]

// ADVANCED - Reading (50 savol)
const readingAdvancedQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'advanced', question: 'Read: "The protagonist\'s ambivalence towards the situation was palpable." - What does "ambivalence" mean?', options: ['Certainty', 'Mixed feelings', 'Happiness', 'Anger'], correct_answer: [1], type: 'single', points: 2 },
  // 49 ta yana...
]

// ==================== LISTENING TESTS ====================

// BEGINNER - Listening (50 savol)
const listeningBeginnerQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'beginner', question: 'Listen: "Hello, how are you?" - What is the speaker saying?', options: ['Hello, how are you?', 'Goodbye', 'Thank you', 'Please'], correct_answer: [0], type: 'single', points: 2 },
  { level: 'beginner', question: 'Listen: "My name is Sarah" - What is the speaker\'s name?', options: ['Mary', 'Sarah', 'Anna', 'Lisa'], correct_answer: [1], type: 'single', points: 2 },
  { level: 'beginner', question: 'Listen: "I am from London" - Where is the speaker from?', options: ['Paris', 'London', 'New York', 'Tokyo'], correct_answer: [1], type: 'single', points: 2 },
  // 47 ta yana...
]

// INTERMEDIATE - Listening (50 savol)
const listeningIntermediateQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'intermediate', question: 'Listen to the conversation. What time is the meeting?', options: ['2 PM', '3 PM', '4 PM', '5 PM'], correct_answer: [1], type: 'single', points: 2 },
  // 49 ta yana...
]

// ADVANCED - Listening (50 savol)
const listeningAdvancedQuestions: Omit<TestQuestion, 'id' | 'created_at'>[] = [
  { level: 'advanced', question: 'Listen to the lecture. What is the main argument?', options: ['Economic growth', 'Environmental protection', 'Social equality', 'Technological advancement'], correct_answer: [1], type: 'single', points: 2 },
  // 49 ta yana...
]

// Barcha savollarni ID bilan qaytarish
export function getAllTestQuestions(testType: 'grammar' | 'reading' | 'listening' = 'grammar'): TestQuestion[] {
  let questions: Omit<TestQuestion, 'id' | 'created_at'>[] = []
  
  if (testType === 'grammar') {
    questions = [...grammarBeginnerQuestions, ...grammarIntermediateQuestions, ...grammarAdvancedQuestions]
  } else if (testType === 'reading') {
    questions = [...readingBeginnerQuestions, ...readingIntermediateQuestions, ...readingAdvancedQuestions]
  } else if (testType === 'listening') {
    questions = [...listeningBeginnerQuestions, ...listeningIntermediateQuestions, ...listeningAdvancedQuestions]
  }

  return questions.map((q, i) => ({
    ...q,
    id: `test-${testType}-${q.level}-${i + 1}`,
    created_at: new Date().toISOString()
  }))
}

// Level va test turi bo'yicha savollarni olish
export function getQuestionsByLevelAndType(
  level: TestLevel,
  testType: 'grammar' | 'reading' | 'listening' = 'grammar',
  count: number = 30
): TestQuestion[] {
  const allQuestions = getAllTestQuestions(testType)
  const levelQuestions = allQuestions.filter(q => q.level === level)
  
  // Random savollar tanlash
  const shuffled = levelQuestions.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, levelQuestions.length))
}

// Test natijasini hisoblash
export function calculateTestScore(
  questions: TestQuestion[],
  answers: number[][]
): { score: number; correct: number; total: number; percentage: number; grade: string } {
  let correct = 0
  let totalPoints = 0
  let earnedPoints = 0

  questions.forEach((q, i) => {
    totalPoints += q.points
    const userAnswer = answers[i] || []
    const correctAnswer = q.correct_answer

    // Javobni tekshirish
    const isCorrect = 
      userAnswer.length === correctAnswer.length &&
      userAnswer.every(a => correctAnswer.includes(a))

    if (isCorrect) {
      correct++
      earnedPoints += q.points
    }
  })

  const percentage = (earnedPoints / totalPoints) * 100
  const score = Math.round(percentage)

  // Baho aniqlash
  let grade = 'Qoniqarsiz'
  if (score >= 90) grade = "A'lo"
  else if (score >= 75) grade = 'Yaxshi'
  else if (score >= 60) grade = 'Qoniqarli'

  return {
    score,
    correct,
    total: questions.length,
    percentage,
    grade
  }
}

// ==================== AI INTEGRATION ====================

// AI bilan savol yaratish (OpenAI API)
export async function generateQuestionsWithAI(
  level: TestLevel,
  testType: 'grammar' | 'reading' | 'listening',
  count: number = 10,
  apiKey?: string
): Promise<TestQuestion[]> {
  if (!apiKey) {
    throw new Error('OpenAI API key kerak!')
  }

  try {
    const prompt = `Generate ${count} ${level} level ${testType} test questions in JSON format. Each question should have:
- question: string
- options: array of 4 strings
- correct_answer: array with index of correct option (0-3)
- type: "single"
- points: 2

Example format:
[
  {
    "question": "Choose the correct verb: I ___ a student",
    "options": ["am", "is", "are", "be"],
    "correct_answer": [0],
    "type": "single",
    "points": 2
  }
]

Generate ${count} questions now:`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an English teacher creating test questions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('AI API xatosi')
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const questions = JSON.parse(content)

    return questions.map((q: any, i: number) => ({
      ...q,
      id: `ai-${testType}-${level}-${Date.now()}-${i}`,
      level,
      created_at: new Date().toISOString()
    }))
  } catch (error) {
    console.error('AI savol yaratishda xato:', error)
    throw error
  }
}
