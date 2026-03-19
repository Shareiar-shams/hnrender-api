import { Router } from 'express';
import { getStories, getItem, getCommentTree } from '../services/hnService';

const router = Router();

// GET /api/hn/stories?type=top&page=1&limit=30
router.get('/stories', async (req, res, next) => {
  try {
    const type = (req.query.type as 'top' | 'new' | 'best') || 'top';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;

    const data = await getStories(type, page, limit);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/hn/story/:id — single story with comments
router.get('/story/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const story = await getItem(id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    // Fetch comment tree
    const comments = story.kids
      ? await getCommentTree(story.kids)
      : [];

    res.json({ ...story, commentTree: comments });
  } catch (err) {
    next(err);
  }
});

export default router;