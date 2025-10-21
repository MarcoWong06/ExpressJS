import express from "express";
import { checkoutController } from "../controller/checkout.controller";

const router = express.Router();
router.post("/", checkoutController);

export default router;