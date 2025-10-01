import { Router } from "express";

const router = Router();


router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v2 is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;