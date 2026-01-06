import express from "express";
import { refundController } from "../controller/refund.controller";

const router = express.Router();
router.post("/", refundController);

export default router;