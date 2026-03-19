import { Router } from 'express';
import prisma from '../services/prisma';

const router = Router();

// GET /api/bookmarks?search=optional
router.get('/', async (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;

    const bookmarks = await prisma.bookmark.findMany({
      where: search
        ? {
            title: { contains: search, mode: 'insensitive' }
          }
        : undefined,
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookmarks);
  } catch (err) {
    next(err);
  }
});

// POST /api/bookmarks
router.post('/', async (req, res, next) => {
  try {
    const { storyId, title, url, author, points, commentCount } = req.body;

    const bookmark = await prisma.bookmark.upsert({
      where: { storyId },
      update: {},  // Don't overwrite if already exists
      create: { storyId, title, url, author, points, commentCount }
    });

    res.status(201).json(bookmark);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/bookmarks/:storyId
router.delete('/:storyId', async (req, res, next) => {
  try {
    const storyId = parseInt(req.params.storyId);

    await prisma.bookmark.delete({ where: { storyId } });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookmarks/check/:storyId
router.get('/check/:storyId', async (req, res, next) => {
  try {
    const storyId = parseInt(req.params.storyId);
    const bookmark = await prisma.bookmark.findUnique({ where: { storyId } });
    res.json({ bookmarked: !!bookmark });
  } catch (err) {
    next(err);
  }
});

export default router;