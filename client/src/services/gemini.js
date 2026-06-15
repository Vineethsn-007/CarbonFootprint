import { GoogleGenerativeAI } from '@google/generative-ai'

// Note: In production, Gemini calls should go through your backend
// This client-side instance is for direct streaming chat only
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

/**
 * Generate personalized eco insights from user emission data
 */
export async function generateInsights(emissionData) {
  const prompt = `You are an expert sustainability coach. Analyze this user's carbon footprint data and provide 3-4 specific, actionable insights.

User's monthly carbon data (kg CO₂):
- Transportation: ${emissionData.transportation?.toFixed(1) || 0} kg
- Energy: ${emissionData.energy?.toFixed(1) || 0} kg  
- Food: ${emissionData.food?.toFixed(1) || 0} kg
- Shopping: ${emissionData.shopping?.toFixed(1) || 0} kg
- Waste: ${emissionData.waste?.toFixed(1) || 0} kg
- Total: ${emissionData.total?.toFixed(1) || 0} kg CO₂

Return a JSON array of insight objects with this structure:
[
  {
    "title": "Short insight title",
    "message": "Specific actionable insight (1-2 sentences)",
    "impact": "Estimated CO₂ saving (e.g., '~50 kg CO₂/year')",
    "category": "transportation|energy|food|shopping|waste",
    "priority": "high|medium|low"
  }
]

Be specific with numbers. Focus on the highest-emission category first.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {
    // fallback
  }

  return [
    {
      title: 'Reduce Your Carbon Footprint',
      message: 'Based on your data, consider switching to public transport or cycling for short trips.',
      impact: '~120 kg CO₂/year',
      category: 'transportation',
      priority: 'high',
    },
  ]
}

/**
 * Generate a weekly eco-plan for the user
 */
export async function generateWeeklyPlan(userData) {
  const prompt = `Create a personalized 7-day eco-friendly action plan for a user with these emissions:
Total monthly CO₂: ${userData.totalKgCO2?.toFixed(1) || 0} kg
Highest category: ${userData.highestCategory || 'transportation'}

Generate a JSON array of 7 daily tasks:
[
  {
    "day": "Monday",
    "task": "Task description",
    "category": "category",
    "impact": "estimated saving",
    "difficulty": "easy|medium|hard"
  }
]`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {
    // fallback
  }

  return []
}

/**
 * Chat with the AI sustainability assistant
 */
export async function chatWithAssistant(messages) {
  let history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  // Google Generative AI SDK requires history to start with a 'user' role
  if (history.length > 0 && history[0].role === 'model') {
    history = history.slice(1)
  }

  const chat = model.startChat({
    history,
    generationConfig: { maxOutputTokens: 1024 },
  })

  const lastMessage = messages[messages.length - 1]
  const systemContext = `You are EcoBot, an expert AI sustainability assistant for a carbon footprint tracking platform. 
You help users understand their environmental impact and suggest practical ways to reduce their carbon footprint. 
Be concise, friendly, and always provide specific, actionable advice with estimated CO₂ savings where possible.`

  const result = await chat.sendMessage(`${systemContext}\n\nUser: ${lastMessage.content}`)
  return result.response.text()
}

/**
 * Predict next month's emissions based on historical data
 */
export async function predictNextMonthEmissions(history) {
  if (!history || history.length < 2) return null

  const prompt = `Given this user's carbon emission history (kg CO₂/month): ${history.map((h) => h.total?.toFixed(1)).join(', ')}

Predict next month's total emissions and provide:
{
  "predicted": <number>,
  "trend": "increasing|decreasing|stable",
  "confidence": "high|medium|low",
  "reasoning": "brief explanation"
}

Return only valid JSON.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
  } catch {
    return null
  }
}
