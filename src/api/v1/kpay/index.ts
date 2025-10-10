import { Router } from "express";
import AllHostedCheckoutOrderRouter from "./routes/AllHostedCheckoutOrder";

const router = Router();
router.use('/checkout', AllHostedCheckoutOrderRouter);
export default router;