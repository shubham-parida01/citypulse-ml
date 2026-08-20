import { Router } from "express";
import healthRouter from "./health.js";
import citypulseRouter from "./citypulse.js";

const router = Router();

router.use(healthRouter);
router.use(citypulseRouter);

export default router;
