import express from "express";
import { resultController } from "../controller/result.controller";

const router = express.Router();
router.post("/", resultController);

export default router;