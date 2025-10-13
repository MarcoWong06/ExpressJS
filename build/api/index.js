import { Router } from 'express';
import kpayV1Router from './v1/kpay';
const apiRouter = Router();
apiRouter.get("/", (_req, res) => {
    res.status(200).json({
        status: "OK",
        message: "API Service is healthy",
        timestamp: new Date().toISOString(),
    });
});
apiRouter.use('/v1/kpay', kpayV1Router);
export default apiRouter;
//# sourceMappingURL=index.js.map