import { Router } from "express";
import CheckoutRouter from "./routes/checkout.routes";

const router = Router();

router.use('/checkout', CheckoutRouter);


export default router;