// import Anthropic from '@anthropic-ai/sdk';

// const client = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY!
// });

// export interface SummaryResult {
//   keyPoints: string[];
//   sentiment: 'positive' | 'negative' | 'mixed' | 'neutral';
//   summary: string;
// }

// export async function generateSummary(
//   storyTitle: string,
//   comments: string[]
// ): Promise<SummaryResult> {
//   // Limit to first 80 comments to stay within context limits
//   const commentSample = comments.slice(0, 80).join('\n\n');

//   const prompt = `You are analyzing a Hacker News discussion thread.

// Story Title: "${storyTitle}"

// Here are the comments from the discussion:
// ---
// ${commentSample}
// ---

// Analyze this discussion and respond ONLY with a valid JSON object in this exact format (no markdown, no explanation, just JSON):
// {
//   "keyPoints": [
//     "First key point discussed (one sentence)",
//     "Second key point discussed (one sentence)",
//     "Third key point discussed (one sentence)",
//     "Fourth key point (if applicable)",
//     "Fifth key point (if applicable)"
//   ],
//   "sentiment": "positive" | "negative" | "mixed" | "neutral",
//   "summary": "A 2-3 sentence paragraph summarizing the overall discussion, the main debate or agreement, and what the community generally thinks."
// }

// Rules:
// - keyPoints: 3-5 bullet points, each a single clear sentence capturing a distinct insight
// - sentiment: choose ONE of: positive, negative, mixed, neutral — based on the overall tone
// - summary: 2-3 sentences max, written in third person, describing what the community discussed
// - Do not include any text outside the JSON object`;

//   const message = await client.messages.create({
//     model: 'claude-opus-4-5',
//     max_tokens: 1024,
//     messages: [{ role: 'user', content: prompt }]
//   });

//   const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

//   // Parse JSON response
//   const parsed: SummaryResult = JSON.parse(responseText.trim());
//   return parsed;
// }