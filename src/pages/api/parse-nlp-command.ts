import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface ParsedCommand {
  action: string
  item: string
  type: 'wine' | 'cocktail' | 'special'
  details?: unknown
}

async function parseCommandWithAI(command: string): Promise<ParsedCommand> {
  try {
    const prompt = `Parse this restaurant/bar management command and return a JSON object with the following structure:
{
  "action": "add|update|delete|86|un86",
  "item": "item name",
  "type": "wine|cocktail|special",
  "details": {
    "price": number (if mentioned),
    "description": "string (if mentioned)",
    "ingredients": "string (for cocktails)",
    "type": "string (wine type, cocktail type, etc.)"
  }
}

Command: "${command}"

Examples:
- "86 the Malbec" -> {"action": "86", "item": "Malbec", "type": "wine"}
- "Add The Fig Old Fashioned to signature cocktails for $16" -> {"action": "add", "item": "The Fig Old Fashioned", "type": "cocktail", "details": {"price": 16, "type": "signature"}}
- "Remove the happy hour special" -> {"action": "delete", "item": "happy hour special", "type": "special"}

Return only the JSON object, no other text.`

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
    
    // Clean up the response to extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const jsonString = jsonMatch ? jsonMatch[0] : 
    
    return JSON.parse(jsonString)
  } catch (error: unknown) {
    console.error("AI parsing failed:", error)
    throw new Error((error as Error).message || "Failed to parse command")
  }