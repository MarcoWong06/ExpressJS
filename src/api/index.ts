import { Request, Response } from "express";
import { Router } from 'express';
import v1Router from './v1';

const apiRouter = Router();



// Get API
apiRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "API Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/v1', v1Router);

export default apiRouter;