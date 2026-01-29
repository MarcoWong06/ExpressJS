import express from "express";
import { sendMailController } from "../controller/sendMail.controller";

const router = express.Router();
router.post("/", sendMailController);

export default router;
