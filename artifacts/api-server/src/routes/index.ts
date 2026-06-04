import { Router, type IRouter } from "express";
import healthRouter from "./health";
import onboardingRouter from "./onboarding";
import contentRouter from "./content";
import lessonsRouter from "./lessons";
import sessionsRouter from "./sessions";
import savedCardsRouter from "./saved-cards";
import roadmapsRouter from "./roadmaps";
import profileRouter from "./profile";
import dailyFeedRouter from "./daily-feed";
import adminRouter from "./admin";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

// Public routes (no auth).
router.use(healthRouter);

// Everything below requires a valid Supabase session.
router.use(requireAuth);
router.use(onboardingRouter);
router.use(contentRouter);
router.use(lessonsRouter);
router.use(sessionsRouter);
router.use(savedCardsRouter);
router.use(roadmapsRouter);
router.use(profileRouter);
router.use(dailyFeedRouter);
router.use(adminRouter);

export default router;
