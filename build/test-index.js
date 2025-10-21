import express from 'express';
const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
app.get('/', (_req, res) => {
    res.send('Hi CWS, it come from Docker!');
});
app.get('/health', (_req, res) => {
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
//# sourceMappingURL=test-index.js.map