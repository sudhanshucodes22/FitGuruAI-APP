require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const authRouter = require('./routes/auth').router;
const habitsRouter = require('./routes/habits');
const coachRouter = require('./routes/coach');
const scannerRouter = require('./routes/scanner');
const workoutsRouter = require('./routes/workouts');

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up routes
app.use('/api/auth', authRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/coach', coachRouter);
app.use('/api/scanner', scannerRouter);
app.use('/api/workouts', workoutsRouter);

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '../')));

// Fallback to index.html for undefined routes (for SPA support if required)
app.get('*', (req, res, next) => {
    // If it's an API route, don't serve HTML
    if (req.url.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Initialize database and start server
async function startServer() {
    await db.init();
    app.listen(PORT, () => {
        console.log(`=========================================`);
        console.log(`  FITGURU BACKEND RUNNING ON PORT ${PORT}`);
        console.log(`  Url: http://localhost:${PORT}`);
        console.log(`=========================================`);
    });
}

startServer();
