const express = require('express');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

function calculateReadinessScore(h) {
    let score = 0;
    
    // 1. Water (max 20 points, target 3000ml)
    const waterScore = Math.min(20, (h.waterMl / 3000) * 20);
    score += waterScore;

    // 2. Sleep (max 20 points, target 8 hours)
    const sleepScore = Math.min(20, (h.sleepHrs / 8) * 20);
    score += sleepScore;

    // 3. Steps (max 20 points, target 10000 steps)
    const stepsScore = Math.min(20, (h.steps / 10000) * 20);
    score += stepsScore;

    // 4. Diet (max 20 points)
    if (h.dietCompleted) score += 20;

    // 5. Workout (max 20 points)
    if (h.workoutCompleted) score += 20;

    return Math.round(score);
}

// 1. Get today's habits
router.get('/today', authenticateToken, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const habits = db.getHabitsByDate(req.user.id, today);
    const meals = db.getMeals(req.user.id).filter(m => m.date === today);
    const calorieProgress = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    res.json({
        ...habits,
        calorieProgress
    });
});

// 2. Toggle or update habit values
router.post('/toggle', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentHabits = db.getHabitsByDate(req.user.id, today);
        
        // Update habit values from request body
        const updatedFields = {
            waterMl: req.body.waterMl !== undefined ? Number(req.body.waterMl) : currentHabits.waterMl,
            sleepHrs: req.body.sleepHrs !== undefined ? Number(req.body.sleepHrs) : currentHabits.sleepHrs,
            steps: req.body.steps !== undefined ? Number(req.body.steps) : currentHabits.steps,
            dietCompleted: req.body.dietCompleted !== undefined ? Boolean(req.body.dietCompleted) : currentHabits.dietCompleted,
            workoutCompleted: req.body.workoutCompleted !== undefined ? Boolean(req.body.workoutCompleted) : currentHabits.workoutCompleted
        };

        // Recalculate readiness
        updatedFields.readinessScore = calculateReadinessScore(updatedFields);

        // Save back
        const habits = await db.saveHabits(req.user.id, today, updatedFields);
        
        // Award XP if completed something new (simple check)
        const user = db.getUserById(req.user.id);
        let xpGained = 0;
        
        // Add 50 XP if a habit was completed
        if (updatedFields.dietCompleted && !currentHabits.dietCompleted) xpGained += 50;
        if (updatedFields.workoutCompleted && !currentHabits.workoutCompleted) xpGained += 100;
        
        if (xpGained > 0) {
            const newXp = user.xp + xpGained;
            const newLevel = Math.floor(newXp / 1000) + 1; // 1000 XP per level
            await db.updateUser(req.user.id, {
                xp: newXp,
                level: newLevel
            });
        }

        const meals = db.getMeals(req.user.id).filter(m => m.date === today);
        const calorieProgress = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        res.json({
            habits: { ...habits, calorieProgress },
            user: db.getUserById(req.user.id),
            xpGained
        });
    } catch (err) {
        console.error('Habit toggle error:', err);
        res.status(500).json({ error: 'Failed to update habits' });
    }
});

module.exports = router;
