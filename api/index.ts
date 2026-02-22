import express from 'express';
import app from '../server/src/index';

const bridge = express();

// Immediate health check for the bridge itself
bridge.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        bridge: 'active',
        env: process.env.VERCEL ? 'Vercel' : 'Local',
        time: new Date().toISOString()
    });
});

// Proxy everything else to the main app
bridge.use(app);

export default bridge;
