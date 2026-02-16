import express from 'express';
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ message: 'Users routes - to be implemented' });
});

export default router;








