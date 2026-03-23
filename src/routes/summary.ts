import { Router } from 'express';
import prisma from '../services/prisma';
import { generateSummary } from '../services/summaryService';
import { getItem, getCommentTree, flattenComments } from '../services/hnService';

const router = Router();

// POST /api/summary/:storyId
router.post('/:storyId', async (req, res, next) => {
  try {
    const storyId = parseInt(req.params.storyId);

    // Return cached summary if exists
    const existing = await prisma.summary.findUnique({ where: { storyId } });
    if (existing) {
      return res.json(existing);
    }

    // Fetch story and comments
    const story = await getItem(storyId);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.kids || story.kids.length === 0) {
      return res.status(400).json({ error: 'No comments to summarize' });
    }

    const commentTree = await getCommentTree(story.kids);
    const flatComments = flattenComments(commentTree);

    if (flatComments.length === 0) {
      return res.status(400).json({ error: 'No readable comments found' });
    }

    // Generate AI summary
    const result = await generateSummary(story.title, flatComments);

    // Cache in DB
    const saved = await prisma.summary.create({
      data: {
        storyId,
        keyPoints: result.keyPoints,
        sentiment: result.sentiment,
        summary: result.summary
      }
    });

    res.json(saved);
  } catch (err) {
    next(err);
  }
});

// GET /api/summary/:storyId — check if cached
router.get('/:storyId', async (req, res, next) => {
  try {
    const storyId = parseInt(req.params.storyId);
    const summary = await prisma.summary.findUnique({ where: { storyId } });
    if (!summary) return res.json({ exists: false })
    res.json(summary);
  } catch (err) {
    next(err);
  }
});

export default router;