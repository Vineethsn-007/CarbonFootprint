import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const apiKeyLine = envContent.split('\n').find(l => l.startsWith('VITE_GEMINI_API_KEY'))
const apiKey = apiKeyLine ? apiKeyLine.split('=')[1].trim().replace(/^"|"$/g, '') : ''

async function test() {
  const genAI = new GoogleGenerativeAI(apiKey)
  
  console.log('Testing gemini-2.5-flash without systemInstruction...')
  try {
    const model1 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const res1 = await model1.generateContent('Hi, write 5 sentences about carbon.')
    console.log('2.5-flash output:', res1.response.text())
  } catch (e) {
    console.log('2.5-flash error:', e.message)
  }

  console.log('\nTesting gemini-1.5-flash without systemInstruction...')
  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const res2 = await model2.generateContent('Hi, write 5 sentences about carbon.')
    console.log('1.5-flash output:', res2.response.text())
  } catch (e) {
    console.log('1.5-flash error:', e.message)
  }

  console.log('\nTesting gemini-2.5-flash WITH systemInstruction...')
  try {
    const model3 = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: 'You are EcoBot.'
    })
    const res3 = await model3.generateContent('Hi, write 5 sentences about carbon.')
    console.log('2.5-flash+sys output:', res3.response.text())
  } catch (e) {
    console.log('2.5-flash+sys error:', e.message)
  }
}

test()
