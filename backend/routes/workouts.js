const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

// 1. Get history of logged workouts
router.get('/history', authenticateToken, (req, res) => {
    const workouts = db.getWorkouts(req.user.id);
    res.json(workouts);
});

// 2. Log a workout session
router.post('/log', authenticateToken, async (req, res) => {
    try {
        const { exercise, reps, durationSec, averageAngle } = req.body;
        if (!exercise || reps === undefined || !durationSec) {
            return res.status(400).json({ error: 'Exercise, reps, and durationSec are required' });
        }

        // Save workout in DB
        const savedWorkout = await db.addWorkout(req.user.id, {
            exercise,
            reps: Number(reps),
            durationSec: Number(durationSec),
            averageAngle: averageAngle ? Number(averageAngle) : 180
        });

        // Award XP: 25 XP per rep!
        const xpGained = Number(reps) * 25;
        const user = db.getUserById(req.user.id);
        const newXp = user.xp + xpGained;
        const newLevel = Math.floor(newXp / 1000) + 1;
        
        // Mark today's workout completed in habit tracker
        const today = new Date().toISOString().split('T')[0];
        const habits = db.getHabitsByDate(req.user.id, today);
        habits.workoutCompleted = true;
        await db.saveHabits(req.user.id, today, habits);

        await db.updateUser(req.user.id, {
            xp: newXp,
            level: newLevel,
            repsCompleted: user.repsCompleted + Number(reps)
        });

        res.json({
            workout: savedWorkout,
            user: db.getUserById(req.user.id),
            xpGained,
            habits
        });

    } catch (err) {
        console.error('Workout log error:', err);
        res.status(500).json({ error: 'Failed to log workout session' });
    }
});

module.exports = router;
