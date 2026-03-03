'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, X, Bot, User } from 'lucide-react'
import api from '@/lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantChatProps {
  portalData?: any
  assignments?: any[]
  exams?: any[]
  notices?: any[]
  className?: string
}

export default function AIAssistantChat({ 
  portalData, 
  assignments = [], 
  exams = [], 
  notices = [],
  className = ''
}: AIAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with:\n• Summarizing your deadlines\n• Reviewing assignments\n• Answering questions about your portal\n• Providing study recommendations\n\nWhat would you like to know?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    if (!messageText) {
      setInput('')
    }
    setLoading(true)

    try {
      // Prepare context for AI
      const context = {
        assignments: assignments.slice(0, 5),
        exams: exams.slice(0, 5),
        notices: notices.slice(0, 3),
        portalData: portalData,
      }

      // Call AI API endpoint
      const response = await api.post('/ai/chat', {
        message: textToSend,
        context,
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response || 'I\'m here to help! Could you please rephrase your question?',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      
      // Fallback response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: handleFallbackResponse(textToSend, assignments, exams, notices),
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleFallbackResponse = (
    query: string,
    assignments: any[],
    exams: any[],
    notices: any[]
  ): string => {
    const lowerQuery = query.toLowerCase()

    // Deadlines/summaries
    if (lowerQuery.includes('deadline') || lowerQuery.includes('due') || lowerQuery.includes('upcoming')) {
      const pending = assignments.filter(a => a.status === 'pending' || a.status === 'overdue')
      if (pending.length === 0) {
        return 'Great news! You have no pending assignments. Keep up the good work! 🎉'
      }
      const summaries = pending.slice(0, 3).map(a => {
        const dueDate = new Date(a.dueDate)
        const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return `• ${a.title} (${a.course}) - ${daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` : `Due in ${daysUntil} days`}`
      }).join('\n')
      return `Here are your upcoming deadlines:\n\n${summaries}\n\n${pending.length > 3 ? `...and ${pending.length - 3} more` : ''}`
    }

    // Assignments
    if (lowerQuery.includes('assignment') || lowerQuery.includes('homework')) {
      const total = assignments.length
      const pending = assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length
      return `You have ${total} total assignments, with ${pending} pending. ${pending > 0 ? 'Focus on completing them before their deadlines!' : 'All assignments are completed. Excellent work!'}`
    }

    // Exams
    if (lowerQuery.includes('exam') || lowerQuery.includes('test')) {
      const upcoming = exams.filter(e => new Date(e.date) > new Date())
      if (upcoming.length === 0) {
        return 'No upcoming exams scheduled. Great job staying ahead!'
      }
      const examList = upcoming.slice(0, 3).map(e => {
        const examDate = new Date(e.date)
        const daysUntil = Math.ceil((examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return `• ${e.subject} - ${examDate.toLocaleDateString()} (${daysUntil} days away)`
      }).join('\n')
      return `Your upcoming exams:\n\n${examList}${upcoming.length > 3 ? `\n\n...and ${upcoming.length - 3} more` : ''}`
    }

    // Notices
    if (lowerQuery.includes('notice') || lowerQuery.includes('announcement')) {
      if (notices.length === 0) {
        return 'No recent notices. Check back later for updates!'
      }
      const noticeList = notices.slice(0, 3).map(n => `• ${n.title} - ${n.category}`).join('\n')
      return `Recent notices:\n\n${noticeList}`
    }

    // Default
    return 'I can help you with deadlines, assignments, exams, and notices. Try asking "What are my upcoming deadlines?" or "Summarize my assignments"!'
  }

  const quickPrompts = [
    'Summarize my deadlines',
    'Upcoming exams',
    'Review assignments',
    'Recent notices',
  ]

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className={`fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50 ${className}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col ${className}`} style={{ height: '600px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">AI Assistant</h3>
            <p className="text-white/80 text-xs">Ask me anything!</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="px-4 pt-2 pb-1 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question here..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
