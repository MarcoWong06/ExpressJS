import { Router } from "express";
import CheckoutRouter from "./routes/checkout";

const router = Router();

router.use('/checkout', CheckoutRouter);


export default router;