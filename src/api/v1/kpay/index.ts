import { Router } from "express";
import CheckoutRouter from "./routes/checkout.routes";
import ResultRouter from "./routes/result.routes";

const router = Router();

router.use('/checkout', CheckoutRouter);
router.use('/result', ResultRouter);


export default router;