# HN Reader Backend

A Hacker News reader backend API with bookmarking capabilities and AI-powered discussion summaries.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
  - [Health Check](#health-check)
  - [Hacker News Routes](#hacker-news-routes)
  - [Bookmark Routes](#bookmark-routes)
  - [Summary Routes (AI)](#summary-routes-ai)
- [Database Models](#database-models)
- [AI Summarization Service](#ai-summarization-service)
- [Scripts](#scripts)

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Groq SDK (Llama 3.1 8B Instant model)
- **HTTP Client**: Axios (for Hacker News Firebase API)

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm run db:generate

   # Run migrations
   pnpm run db:migrate
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

The server will start on port 4000 (or the port specified in your `.env` file).

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 4000) | No |
| `FRONTEND_URL` | Allowed CORS origin | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GROQ_API_KEY` | API key from Groq dashboard | Yes |

## API Routes

### Health Check

#### `GET /health`

Returns the health status of the server.

**Response:**
```json
{ "status": "ok" }
```

---

### Hacker News Routes

Base URL: `/api/hn`

#### `GET /api/hn/stories`

Fetch paginated list of Hacker News stories.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `top` | Story type: `top`, `new`, or `best` |
| `page` | number | `1` | Page number |
| `limit` | number | `30` | Number of stories per page |

**Response:**
```json
{
  "stories": [
    {
      "id": 12345678,
      "title": "Story Title",
      "url": "https://...",
      "by": "author",
      "score": 100,
      "time": 1234567890,
      "kids": [12345679, 12345680],
      "descendants": 50
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 30,
  "hasMore": true
}
```

#### `GET /api/hn/story/:id`

Fetch a single story with its comment tree.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | number | Story ID |

**Response:**
```json
{
  "id": 12345678,
  "title": "Story Title",
  "url": "https://...",
  "by": "author",
  "score": 100,
  "time": 1234567890,
  "kids": [12345679, ...],
  "descendants": 50,
  "commentTree": [
    {
      "id": 12345679,
      "by": "commenter",
      "text": "Comment text",
      "kids": [...]
    }
  ]
}
```

---

### Bookmark Routes

Base URL: `/api/bookmarks`

#### `GET /api/bookmarks`

Get all bookmarks.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Optional search filter (case-insensitive) |

**Response:**
```json
[
  {
    "id": 1,
    "storyId": 12345678,
    "title": "Story Title",
    "url": "https://...",
    "author": "author",
    "points": 100,
    "commentCount": 50,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### `POST /api/bookmarks`

Create a new bookmark.

**Request Body:**
```json
{
  "storyId": 12345678,
  "title": "Story Title",
  "url": "https://...",
  "author": "author",
  "points": 100,
  "commentCount": 50
}
```

**Response:** Created bookmark object with `201` status.

#### `DELETE /api/bookmarks/:storyId`

Delete a bookmark by story ID.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `storyId` | number | Story ID |

**Response:**
```json
{ "message": "Bookmark removed" }
```

#### `GET /api/bookmarks/check/:storyId`

Check if a story is bookmarked.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `storyId` | number | Story ID |

**Response:**
```json
{ "bookmarked": true }
```

---

### Summary Routes (AI)

Base URL: `/api/summary`

#### `POST /api/summary/:storyId`

Generate an AI summary for a story's discussion thread.

> **Note:** If a summary already exists for this story, it returns the cached version.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `storyId` | number | Story ID |

**Process:**
1. Checks for cached summary in database
2. Fetches story and comments from Hacker News API
3. Uses Groq AI (Llama 3.1) to analyze comments
4. Returns key points, sentiment, and summary

**Response:**
```json
{
  "id": 1,
  "storyId": 12345678,
  "keyPoints": [
    "First key point discussed",
    "Second key point discussed",
    "Third key point discussed"
  ],
  "sentiment": "positive",
  "summary": "A 2-3 sentence summary of the overall discussion.",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/summary/:storyId`

Check if a summary exists for a story (cached).

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `storyId` | number | Story ID |

**Response (if exists):**
```json
{
  "id": 1,
  "storyId": 12345678,
  "keyPoints": [...],
  "sentiment": "positive",
  "summary": "...",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Response (if not exists):**
```json
{ "exists": false }
```

---

## Database Models

### Bookmark

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key, auto-increment |
| `storyId` | Int | Unique story ID from HN |
| `title` | String | Story title |
| `url` | String? | Story URL (optional) |
| `author` | String | Story author |
| `points` | Int | Story score |
| `commentCount` | Int | Number of comments |
| `createdAt` | DateTime | Creation timestamp |

### Summary

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Primary key, auto-increment |
| `storyId` | Int | Unique story ID from HN |
| `keyPoints` | String[] | Array of 3-5 key discussion points |
| `sentiment` | String | Sentiment: `positive`, `negative`, `mixed`, or `neutral` |
| `summary` | String | 2-3 sentence summary |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

## AI Summarization Service

The `summaryService.ts` uses Groq's Llama 3.1 8B Instant model to analyze Hacker News discussion threads.

### Function: `generateSummary`

```typescript
generateSummary(
  storyTitle: string,
  comments: string[]
): Promise<SummaryResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `storyTitle` | string | The title of the HN story |
| `comments` | string[] | Array of comment strings (flattened from tree) |

**Returns:**

```typescript
interface SummaryResult {
  keyPoints: string[]      // 3-5 key discussion points
  sentiment: 'positive' | 'negative' | 'mixed' | 'neutral'
  summary: string          // 2-3 sentence summary
}
```

### How It Works

1. **Comment Sampling**: Takes the first 80 comments and joins them into a single text block
2. **Prompt Engineering**: Sends a carefully crafted prompt to the AI that:
   - Provides the story title and comments
   - Requests exactly 3-5 key points as single sentences
   - Asks for sentiment classification
   - Requests a 2-3 sentence summary in third person
   - Explicitly requests raw JSON output (no markdown formatting)
3. **Response Parsing**: Cleans the response by removing any markdown code blocks, then parses the JSON
4. **Caching**: Results are stored in PostgreSQL to avoid repeated API calls

### API Model Used

- **Model**: `llama-3.1-8b-instant`
- **Provider**: Groq (free tier, fast inference)
- **Temperature**: 0.3 (for consistent, focused outputs)
- **Max Tokens**: 1024

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server with hot reload |
| `pnpm run build` | Compile TypeScript to JavaScript |
| `pnpm run start` | Start production server |
| `pnpm run db:generate` | Generate Prisma client |
| `pnpm run db:migrate` | Apply database migrations |

---

## License

ISC