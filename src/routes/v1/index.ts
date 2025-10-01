import { Router } from "express";
import { AuthRoutesv1 } from "./auth.route";
import { TaskRoutesV1 } from "./tasks.route";
import { AdminRouterV1 } from "./admin.router";

const router = Router();

// Mount routes
router.use('/auth', AuthRoutesv1);
router.use('/tasks', TaskRoutesV1);
router.use('/admin', AdminRouterV1);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;