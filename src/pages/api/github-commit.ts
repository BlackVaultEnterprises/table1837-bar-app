import { NextApiRequest, NextApiResponse } from 'next'
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GH_PAT,
})

const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'BlackVaultEnterprises'
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'table1837-bar-app'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { 
      filePath, 
      content, 
      commitMessage, 
      branch = 'main' 
    } = req.body

    if (!filePath || !content || !commitMessage) {
      return res.status(400).json({ 
        error: 'filePath, content, and commitMessage are required' 
      })
    }

    // Get the current file (if it exists) to get its SHA
    let currentFileSha: string | undefined
    try {
      const { data: currentFile } = await octokit.rest.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: filePath,
        ref: branch,
      })

      if ('sha' in currentFile) {
        currentFileSha = currentFile.sha
      }
    } catch (error: any) {
      // File doesn't exist yet, which is fine for new files
      if (error.status !== 404) {
        throw error
      }
    }

    // Create or update the file
    const { data: commitData } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: filePath,
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      branch: branch,
      ...(currentFileSha && { sha: currentFileSha }),
    })

    return res.status(200).json({
      success: true,
      commit: {
        sha: commitData.commit.sha,
        url: commitData.commit.html_url,
        message: commitMessage,
      },
      file: {
        path: filePath,
        url: commitData.content?.html_url,
      },
    })

  } catch (error: any) {
    console.error('GitHub commit error:', error)
    
    return res.status(500).json({
      error: 'Failed to commit to GitHub',
      details: error.message,
    })
  }
}

