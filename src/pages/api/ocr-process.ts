import { NextApiRequest, NextApiResponse } from 'next'
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import { createWorker } from 'tesseract.js'
import { supabase } from '@/lib/supabase'
import fs from 'fs'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

async function processOCR(imageUrl: string): Promise<string> {
  const worker = await createWorker('eng')
  
  try {
    const { data: { text } } = await worker.recognize(imageUrl)
    return text
  } finally {
    await worker.terminate()
  }
}

async function enhanceOCRWithAI(rawText: string): Promise<string> {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Please clean up and structure this OCR text from a restaurant menu. Extract menu items with prices and organize them clearly. Remove any OCR artifacts and fix spelling errors. Here's the raw OCR text:\n\n${rawText}`
          }]
        }]
      })
    })

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || rawText
  } catch (error: unknown) {
    console.error("AI enhancement failed:", error)
    return rawText // Fallback to raw text if AI fails
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    const [fields, files] = await form.parse(req)
    
    const file = Array.isArray(files.image) ? files.image[0] : files.image
    const title = Array.isArray(fields.title) ? fields.title[0] : fields.title

    if (!file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.filepath, {
      folder: 'table1837-menus',
      resource_type: 'image',
    })

    // Process OCR
    const rawOCRText = await processOCR(uploadResult.secure_url)
    
    // Enhance with AI
    const processedOCRText = await enhanceOCRWithAI(rawOCRText)

    // Save to Supabase
    const { data: menu, error: supabaseError } = await supabase
      .from('menus')
      .insert([
        {
          title: title || 'Uploaded Menu',
          image_url: uploadResult.secure_url,
          ocr_raw_text: rawOCRText,
          ocr_processed_text: processedOCRText,
          is_featured: false,
        }
      ])
      .select()
      .single()

    if (supabaseError) {
      return res.status(400).json({ error: supabaseError.message })
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath)

    return res.status(200).json({
      success: true,
      menu,
      cloudinary_url: uploadResult.secure_url,
      ocr_raw: rawOCRText,
      ocr_processed: processedOCRText,
    })

  } catch (error: unknown) {
    console.error('OCR processing error:', error)
    return res.status(500).json({
      error: 'Failed to process OCR',
      details: (error as Error).message,
    })
  }
}

