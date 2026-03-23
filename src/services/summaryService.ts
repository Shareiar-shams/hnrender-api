import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
})

export interface SummaryResult {
  keyPoints: string[]
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'
  summary: string
}

export async function generateSummary(
  storyTitle: string,
  comments: string[]
): Promise<SummaryResult> {
  const commentSample = comments.slice(0, 80).join('\n\n')

  const prompt = `You are analyzing a Hacker News discussion thread.

Story Title: "${storyTitle}"

Here are the comments from the discussion:
---
${commentSample}
---

Analyze this discussion and respond ONLY with a valid JSON object in this exact format (no markdown, no explanation, no backticks, just raw JSON):
{
  "keyPoints": [
    "First key point discussed (one sentence)",
    "Second key point discussed (one sentence)",
    "Third key point discussed (one sentence)"
  ],
  "sentiment": "positive",
  "summary": "A 2-3 sentence paragraph summarizing the overall discussion."
}

Rules:
- keyPoints: 3-5 items, each a single clear sentence
- sentiment: must be exactly one of: positive, negative, mixed, neutral
- summary: 2-3 sentences max, third person
- Return ONLY the raw JSON, absolutely nothing else`

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 1024,
  })

  const text = response.choices[0]?.message?.content || ''

  // Clean in case model adds markdown backticks
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  const parsed: SummaryResult = JSON.parse(cleaned)
  return parsed
}