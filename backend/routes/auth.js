const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fitguru_super_secret_jwt_key_123';

// Auth Middleware to protect backend API routes
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid or expired' });
        }
        req.user = decoded;
        next();
    });
}

// 1. User Registration
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const existingUser = db.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(8);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const user = await db.createUser({
            username,
            passwordHash
        });

        // Issue token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                xp: user.xp,
                level: user.level,
                streak: user.streak
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server registration failed' });
    }
});

// 2. User Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = db.findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Issue token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                xp: user.xp,
                level: user.level,
                streak: user.streak
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server login failed' });
    }
});

// 3. Get Protected Profile Data
router.get('/profile', authenticateToken, (req, res) => {
    const user = db.getUserById(req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        targetReps: user.targetReps,
        repsCompleted: user.repsCompleted,
        prSquat: user.prSquat !== undefined ? user.prSquat : 185,
        prBench: user.prBench !== undefined ? user.prBench : 125,
        prDeadlift: user.prDeadlift !== undefined ? user.prDeadlift : 220,
        prOverhead: user.prOverhead !== undefined ? user.prOverhead : 85,
        prMile: user.prMile !== undefined ? user.prMile : "5:42",
        avatar: user.avatar !== undefined ? user.avatar : "https://lh3.googleusercontent.com/aida-public/AB6AXuDUNBV-dQS-REdRAB23eBJcDl6V5-y2pdbh1C6IYI9DHI6yIN_6MjqkgtPaALTwjbKtbQ2TlyoIiFvfv1Zl3Ft33MneKWuedfmgq07GW9XVtbBCZyC8QEaMNCLvMh0wzoSNePNuZZRDuvvgBnkKeQ0PbbXiR3Adw3aA_qMnkz46P9MXWUNagIs5smYW2x1dDaJ9vzbWc5avLYBOmXzGmiuqe6zRShmEEmyLUgEyOunSni5WrPpFMdpn8PCQ6qfTLY6oq6cb7Secrw"
    });
});

// 4. Update Profile Data (PRs, Avatar)
router.post('/profile/update', authenticateToken, async (req, res) => {
    try {
        const user = db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {};
        const allowedUpdates = ['prSquat', 'prBench', 'prDeadlift', 'prOverhead', 'prMile', 'avatar', 'xp', 'level', 'streak', 'targetReps', 'username'];
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const updatedUser = await db.updateUser(req.user.id, updates);
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                xp: updatedUser.xp,
                level: updatedUser.level,
                streak: updatedUser.streak,
                targetReps: updatedUser.targetReps,
                repsCompleted: updatedUser.repsCompleted,
                prSquat: updatedUser.prSquat,
                prBench: updatedUser.prBench,
                prDeadlift: updatedUser.prDeadlift,
                prOverhead: updatedUser.prOverhead,
                prMile: updatedUser.prMile,
                avatar: updatedUser.avatar
            }
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

module.exports = {
    router,
    authenticateToken
};
