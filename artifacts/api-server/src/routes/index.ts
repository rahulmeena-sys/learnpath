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

const router: IRouter = Router();

router.use(healthRouter);
router.use(onboardingRouter);
router.use(contentRouter);
router.use(lessonsRouter);
router.use(sessionsRouter);
router.use(savedCardsRouter);
router.use(roadmapsRouter);
router.use(profileRouter);
router.use(dailyFeedRouter);

export default router;
