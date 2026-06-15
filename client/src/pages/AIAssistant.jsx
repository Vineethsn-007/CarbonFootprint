import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RefreshCw, Download } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useEmissions } from '../hooks/useEmissions'
import { chatWithAssistant, generateWeeklyPlan } from '../services/gemini'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatRelativeTime } from '../utils/formatters'
import { clsx } from 'clsx'

const SUGGESTED_PROMPTS = [
  'How can I reduce my transportation emissions?',
  'What diet changes will lower my carbon footprint?',
  'Generate my weekly eco plan',
  'How does my footprint compare to the global average?',
  'Explain carbon offset options for me',
  'What are the most impactful changes I can make?',
]

export default function AIAssistant() {
  const { profile } = useAuth()
  const { latestEmission } = useEmissions()
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: `Hello ${profile?.displayName?.split(' ')[0] || 'there'}! 👋 I'm EcoBot, your AI sustainability coach.\n\nI can help you:\n• Analyse your carbon footprint habits\n• Generate a personalised weekly eco plan\n• Suggest specific reduction actions with CO₂ savings\n• Answer any sustainability questions\n\nWhat would you like to explore today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [weeklyPlan, setWeeklyPlan] = useState(null)
  const [weeklyPlanLoading, setWeeklyPlanLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { document.title = 'AI Assistant – EcoTrack' }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')

    const userMsg = { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }
    setMessages((m) => [...m, userMsg])
    setLoading(true)

    try {
      const contextMsg = latestEmission
        ? `[User context: Monthly CO₂ = ${latestEmission.totalKgCO2} kg. Transport: ${latestEmission.transportation} kg, Energy: ${latestEmission.energy} kg, Food: ${latestEmission.food} kg]\n\n`
        : ''
      const allMsgs = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.role === 'user' && m.id === userMsg.id ? contextMsg + m.content : m.content,
      }))

      const response = await chatWithAssistant(allMsgs)
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() }])
    } catch {
      setMessages((m) => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please check that your Gemini API key is configured in the `.env` file and try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleWeeklyPlan = async () => {
    setWeeklyPlanLoading(true)
    try {
      const plan = await generateWeeklyPlan({
        totalKgCO2: latestEmission?.totalKgCO2 || 400,
        highestCategory: 'transportation',
      })
      setWeeklyPlan(plan)
    } finally {
      setWeeklyPlanLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: 'Chat cleared! How can I help you with your sustainability journey?',
      timestamp: new Date(),
    }])
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-normal text-white nx-display flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#2D8CFF]" aria-hidden="true" />
            AI Sustainability Coach
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1 font-['JetBrains_Mono',monospace]">Powered by Gemini AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleWeeklyPlan} loading={weeklyPlanLoading}
            leftIcon={<Sparkles className="w-4 h-4" />} aria-label="Generate weekly eco plan">
            Weekly Plan
          </Button>
          <Button variant="ghost" size="sm" onClick={clearChat} leftIcon={<RefreshCw className="w-4 h-4" />} aria-label="Clear chat">
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat panel */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx('flex gap-3 animate-slide-up', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                >
                  {/* Avatar */}
                  <div className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    msg.role === 'assistant' ? 'gradient-eco' : 'bg-[#262A34] border border-[#30354A]'
                  )} aria-hidden="true">
                    {msg.role === 'assistant'
                      ? <Bot className="w-4 h-4 text-white" />
                      : <User className="w-4 h-4 text-[#A1A1AA]" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={clsx('max-w-[80%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start', 'flex flex-col')}>
                    <div className={clsx(
                      'px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-[\'JetBrains_Mono\',monospace]',
                      msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-white'
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-[#A1A1AA] px-1 font-['JetBrains_Mono',monospace]">
                      {formatRelativeTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full gradient-eco flex items-center justify-center" aria-hidden="true">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai px-4 py-3 flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-[#A1A1AA] font-['JetBrains_Mono',monospace]">EcoBot is thinking…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#30354A] p-4">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage() }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about reducing your carbon footprint…"
                  disabled={loading}
                  aria-label="Chat message input"
                  className="flex-1 h-10 px-4 text-sm rounded-lg border border-[#30354A] bg-[#1a1e2a] text-white font-['JetBrains_Mono',monospace] placeholder:text-[#A1A1AA]/50 focus:outline-none focus:ring-2 focus:ring-[#2D8CFF] disabled:opacity-40"
                />
                <Button
                  type="submit"
                  variant="eco"
                  size="icon"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar: suggested prompts + weekly plan */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  aria-label={`Ask: ${prompt}`}
                  className="w-full text-left text-xs p-3 rounded-lg border border-[#30354A] hover:border-[#2D8CFF]/30 hover:bg-[#2D8CFF]/5 transition-all duration-200 text-[#A1A1AA] hover:text-white font-['JetBrains_Mono',monospace]"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>

          {weeklyPlan && weeklyPlan.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  Your Weekly Eco Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {weeklyPlan.map((day, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#2D8CFF]/5 border border-[#2D8CFF]/15 space-y-1">
                    <p className="text-xs font-semibold text-[#2D8CFF] font-['JetBrains_Mono',monospace]">{day.day}</p>
                    <p className="text-xs text-white font-['JetBrains_Mono',monospace]">{day.task}</p>
                    {day.impact && <p className="text-xs text-[#A1A1AA] font-['JetBrains_Mono',monospace]">💚 {day.impact}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
