import express, { Request, Response } from 'express';

const app = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// 基础路由
app.get('/', (_req: Request, res: Response) => {
  res.send('Hi CWS, it come from Docker!');
});

// 健康检查端点
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Service is healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`服務器運行在 http://localhost:${port}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;