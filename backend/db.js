const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

class JSONDatabase {
    constructor() {
        this.data = {
            users: [],
            habits: [],
            workouts: [],
            meals: [],
            chats: []
        };
    }

    async init() {
        try {
            // Check if file exists
            const fileExists = await fs.access(DB_PATH).then(() => true).catch(() => false);
            if (fileExists) {
                const content = await fs.readFile(DB_PATH, 'utf-8');
                this.data = JSON.parse(content || '{}');
                // Ensure all collections exist
                this.data.users = this.data.users || [];
                this.data.habits = this.data.habits || [];
                this.data.workouts = this.data.workouts || [];
                this.data.meals = this.data.meals || [];
                this.data.chats = this.data.chats || [];
                console.log('JSON Database loaded successfully from db.json');
            } else {
                console.log('Initializing fresh JSON database with mock data...');
                this.initMockData();
                await this.save();
            }
        } catch (err) {
            console.error('Failed to initialize JSON database:', err);
        }
    }

    initMockData() {
        // Create a default mock user (password is 'fitguru123', hashed by bcrypt in auth later, or plain text check)
        // We will store hashed password: using bcrypt.hashSync('fitguru123', 8)
        // Since bcryptjs is async/sync, we hash it. For mock, we'll store a pre-hashed string of 'fitguru123':
        // '$2a$08$zE7v/pYg7y3nC3c2XzP9Qux2Wn6bW1cZJ28Zz2g0C100m.w5S2W5G'
        const mockUser = {
            id: '1',
            username: 'sudhanshucodes22',
            passwordHash: '$2a$08$zE7v/pYg7y3nC3c2XzP9Qux2Wn6bW1cZJ28Zz2g0C100m.w5S2W5G', // bcrypt of 'fitguru123'
            xp: 2450,
            streak: 7,
            level: 12,
            targetReps: 12,
            repsCompleted: 8,
            prSquat: 185,
            prBench: 125,
            prDeadlift: 220,
            prOverhead: 85,
            prMile: "5:42",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUNBV-dQS-REdRAB23eBJcDl6V5-y2pdbh1C6IYI9DHI6yIN_6MjqkgtPaALTwjbKtbQ2TlyoIiFvfv1Zl3Ft33MneKWuedfmgq07GW9XVtbBCZyC8QEaMNCLvMh0wzoSNePNuZZRDuvvgBnkKeQ0PbbXiR3Adw3aA_qMnkz46P9MXWUNagIs5smYW2x1dDaJ9vzbWc5avLYBOmXzGmiuqe6zRShmEEmyLUgEyOunSni5WrPpFMdpn8PCQ6qfTLY6oq6cb7Secrw",
            createdAt: new Date().toISOString()
        };
        this.data.users.push(mockUser);

        // Prefill some daily habits
        const today = new Date().toISOString().split('T')[0];
        this.data.habits.push({
            id: 'hab-1',
            userId: '1',
            date: today,
            waterMl: 1500,
            sleepHrs: 7.5,
            steps: 8500,
            dietCompleted: true,
            workoutCompleted: false,
            readinessScore: 78
        });

        // Prefill mock chats
        this.data.chats.push({
            id: 'chat-1',
            userId: '1',
            sender: 'coach',
            text: 'Welcome back, Athlete! Ready to lock targets and destroy today\'s workout? Ask me any squat, bench, or nutrition questions.',
            timestamp: new Date(Date.now() - 3600000).toISOString()
        });

        // Prefill mock workouts
        this.data.workouts.push({
            id: 'work-1',
            userId: '1',
            date: today,
            exercise: 'Bench Press',
            reps: 8,
            durationSec: 28,
            averageAngle: 143.8
        });
    }

    async save() {
        try {
            await fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
            console.error('Failed to save JSON database:', err);
        }
    }

    // CRUD Helper: Users
    findUserByUsername(username) {
        return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    }

    getUserById(id) {
        return this.data.users.find(u => u.id === id);
    }

    async createUser(user) {
        const newUser = {
            id: String(this.data.users.length + 1),
            xp: 0,
            streak: 0,
            level: 1,
            targetReps: 10,
            repsCompleted: 0,
            prSquat: 185,
            prBench: 125,
            prDeadlift: 220,
            prOverhead: 85,
            prMile: "5:42",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUNBV-dQS-REdRAB23eBJcDl6V5-y2pdbh1C6IYI9DHI6yIN_6MjqkgtPaALTwjbKtbQ2TlyoIiFvfv1Zl3Ft33MneKWuedfmgq07GW9XVtbBCZyC8QEaMNCLvMh0wzoSNePNuZZRDuvvgBnkKeQ0PbbXiR3Adw3aA_qMnkz46P9MXWUNagIs5smYW2x1dDaJ9vzbWc5avLYBOmXzGmiuqe6zRShmEEmyLUgEyOunSni5WrPpFMdpn8PCQ6qfTLY6oq6cb7Secrw",
            createdAt: new Date().toISOString(),
            ...user
        };
        this.data.users.push(newUser);
        await this.save();
        return newUser;
    }

    async updateUser(id, updateData) {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.data.users[index] = { ...this.data.users[index], ...updateData };
            await this.save();
            return this.data.users[index];
        }
        return null;
    }

    // CRUD Helper: Habits
    getHabitsByDate(userId, date) {
        let habit = this.data.habits.find(h => h.userId === userId && h.date === date);
        if (!habit) {
            // Return a default schema (not saved yet, will save when toggled)
            habit = {
                userId,
                date,
                waterMl: 0,
                sleepHrs: 0,
                steps: 0,
                dietCompleted: false,
                workoutCompleted: false,
                readinessScore: 50
            };
        }
        return habit;
    }

    async saveHabits(userId, date, habitData) {
        const index = this.data.habits.findIndex(h => h.userId === userId && h.date === date);
        const updatedHabit = {
            id: index !== -1 ? this.data.habits[index].id : 'hab-' + Date.now(),
            userId,
            date,
            ...habitData
        };

        if (index !== -1) {
            this.data.habits[index] = updatedHabit;
        } else {
            this.data.habits.push(updatedHabit);
        }
        await this.save();
        return updatedHabit;
    }

    // CRUD Helper: Workouts
    getWorkouts(userId) {
        return this.data.workouts.filter(w => w.userId === userId);
    }

    async addWorkout(userId, workout) {
        const newWorkout = {
            id: 'work-' + Date.now(),
            userId,
            date: new Date().toISOString().split('T')[0],
            ...workout
        };
        this.data.workouts.push(newWorkout);
        await this.save();
        return newWorkout;
    }

    // CRUD Helper: Meals
    getMeals(userId) {
        return this.data.meals.filter(m => m.userId === userId);
    }

    async addMeal(userId, meal) {
        const newMeal = {
            id: 'meal-' + Date.now(),
            userId,
            date: new Date().toISOString().split('T')[0],
            ...meal
        };
        this.data.meals.push(newMeal);
        await this.save();
        return newMeal;
    }

    // CRUD Helper: Chats
    getChats(userId) {
        return this.data.chats.filter(c => c.userId === userId);
    }

    async addChat(userId, sender, text) {
        const newChat = {
            id: 'chat-' + Date.now(),
            userId,
            sender,
            text,
            timestamp: new Date().toISOString()
        };
        this.data.chats.push(newChat);
        await this.save();
        return newChat;
    }
}

// Singleton database instance
const db = new JSONDatabase();
module.exports = db;
