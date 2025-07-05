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
}

async function executeCommand(parsedCommand: ParsedCommand) {
  const { action, item, type, details } = parsedCommand

  switch (type) {
    case "wine":
      return await executeWineCommand(action, item, details)
    case "cocktail":
      return await executeCocktailCommand(action, item, details)
    case "special":
      return await executeSpecialCommand(action, item, details)
    default:
      throw new Error(`Unknown item type: ${type}`)
  }
}

async function executeWineCommand(action: string, item: string, details: unknown) {
  switch (action) {
    case "86":
      const { data: wine, error: supabaseError } = await supabase
        .from("wines")
        .update({ is_86d: true })
        .ilike("name", `%${item}%`)
        .select()

      if (supabaseError) throw supabaseError

      // Also add to 86'd items log
      await supabase
        .from("eighty_sixed_items")
        .insert([{
          item_name: item,
          item_type: "wine",
          item_id: (wine?.[0] as { id: string })?.id
        }])

      return { success: true, message: `86'd wine: ${item}`, data: wine }

    case "un86":
      const { data: unWine, error: unError } = await supabase
        .from("wines")
        .update({ is_86d: false })
        .ilike("name", `%${item}%`)
        .select()

      if (unError) throw unError
      return { success: true, message: `Un-86'd wine: ${item}`, data: unWine }

    case "add":
      const { data: newWine, error: addError } = await supabase
        .from("wines")
        .insert([{
          name: item,
          type: (details as { type?: string })?.type || "unknown",
          price: (details as { price?: number })?.price,
          description: (details as { description?: string })?.description,
          is_86d: false
        }])
        .select()

      if (addError) throw addError
      return { success: true, message: `Added wine: ${item}`, data: newWine }

    default:
      throw new Error(`Unknown wine action: ${action}`)
  }
}

async function executeCocktailCommand(action: string, item: string, details: unknown) {
  switch (action) {
    case "86":
      const { data: cocktail, error: supabaseError } = await supabase
        .from("cocktails")
        .update({ is_86d: true })
        .ilike("name", `%${item}%`)
        .select()

      if (supabaseError) throw supabaseError

      await supabase
        .from("eighty_sixed_items")
        .insert([{
          item_name: item,
          item_type: "cocktail",
          item_id: (cocktail?.[0] as { id: string })?.id
        }])

      return { success: true, message: `86'd cocktail: ${item}`, data: cocktail }

    case "add":
      const { data: newCocktail, error: addError } = await supabase
        .from("cocktails")
        .insert([{
          name: item,
          ingredients: (details as { ingredients?: string })?.ingredients || "TBD",
          price: (details as { price?: number })?.price,
          type: (details as { type?: string })?.type || "classic",
          is_signature: (details as { type?: string })?.type === "signature",
          is_86d: false
        }])
        .select()

      if (addError) throw addError
      return { success: true, message: `Added cocktail: ${item}`, data: newCocktail }

    default:
      throw new Error(`Unknown cocktail action: ${action}`)
  }
}

async function executeSpecialCommand(action: string, item: string, details: unknown) {
  switch (action) {
    case "add":
      const { data: newSpecial, error: addError } = await supabase
        .from("specials")
        .insert([{
          name: item,
          description: (details as { description?: string })?.description,
          price: (details as { price?: number })?.price,
          type: (details as { type?: string })?.type || "daily",
          is_active: true
        }])
        .select()

      if (addError) throw addError
      return { success: true, message: `Added special: ${item}`, data: newSpecial }

    case "delete":
      const { data: deletedSpecial, error: deleteError } = await supabase
        .from("specials")
        .update({ is_active: false })
        .ilike("name", `%${item}%`)
        .select()

      if (deleteError) throw deleteError
      return { success: true, message: `Removed special: ${item}`, data: deletedSpecial }

    default:
      throw new Error(`Unknown special action: ${action}`)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { command } = req.body

    if (!command) {
      return res.status(400).json({ error: "Command is required" })
    }

    // Parse the command using AI
    const parsedCommand = await parseCommandWithAI(command)

    // Execute the parsed command
    const result = await executeCommand(parsedCommand)

    return res.status(200).json({
      success: true,
      original_command: command,
      parsed_command: parsedCommand,
      result: result
    })

  } catch (error: unknown) {
    console.error("NLP command processing error:", error)
    return res.status(500).json({
      error: "Failed to process command",
      details: (error as Error).message,
    })
  }
}
