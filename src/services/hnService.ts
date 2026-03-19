import axios from 'axios';

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

// Fetch list of story IDs
export async function getStoryIds(type: 'top' | 'new' | 'best'): Promise<number[]> {
  const { data } = await axios.get(`${HN_BASE}/${type}stories.json`);
  return data;
}

// Fetch a single item (story or comment)
export async function getItem(id: number): Promise<any> {
  const { data } = await axios.get(`${HN_BASE}/item/${id}.json`);
  return data;
}

// Fetch multiple stories with pagination
export async function getStories(type: 'top' | 'new' | 'best', page: number, limit: number) {
  const allIds = await getStoryIds(type);
  const start = (page - 1) * limit;
  const pageIds = allIds.slice(start, start + limit);

  // Fetch all stories in parallel
  const stories = await Promise.all(pageIds.map(id => getItem(id)));

  return {
    stories: stories.filter(Boolean), // Remove nulls
    total: allIds.length,
    page,
    limit,
    hasMore: start + limit < allIds.length
  };
}

// Recursively fetch comment tree (depth-limited to avoid huge payloads)
export async function getCommentTree(ids: number[], depth = 0): Promise<any[]> {
  if (!ids || ids.length === 0 || depth > 3) return [];

  const comments = await Promise.all(ids.map(id => getItem(id)));
  const validComments = comments.filter(c => c && !c.deleted && !c.dead);

  // Fetch children in parallel for each comment
  const withChildren = await Promise.all(
    validComments.map(async (comment) => ({
      ...comment,
      children: comment.kids
        ? await getCommentTree(comment.kids, depth + 1)
        : []
    }))
  );

  return withChildren;
}

// Flatten comment tree to plain text for AI summarization
export function flattenComments(comments: any[], result: string[] = []): string[] {
  for (const comment of comments) {
    if (comment.text) {
      // Strip HTML tags from HN comments
      const clean = comment.text.replace(/<[^>]*>/g, ' ').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"');
      result.push(`[${comment.by || 'anonymous'}]: ${clean}`);
    }
    if (comment.children?.length) {
      flattenComments(comment.children, result);
    }
  }
  return result;
}