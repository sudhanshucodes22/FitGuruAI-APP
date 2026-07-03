const express = require('express');
const { GoogleGenAI } = require('@google/generative-ai');
const { authenticateToken } = require('./auth');
const db = require('../db');

const router = express.Router();

// Helper to instantiate Gemini client safely
function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    
    try {
        // Correct imports for GoogleGenAI or @google/generative-ai
        const { GoogleGenAI } = require('@google/generative-ai');
        // Actually, the standard package is:
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        return new GoogleGenerativeAI(apiKey);
    } catch (e) {
        console.error('Failed to import GoogleGenerativeAI SDK:', e);
        return null;
    }
}

// 1. Get previous chat history
router.get('/history', authenticateToken, (req, res) => {
    const chats = db.getChats(req.user.id);
    res.json(chats);
});

// 2. Post new message and get AI response
router.post('/chat', authenticateToken, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Save user message in DB
        await db.addChat(req.user.id, 'user', message);

        const aiClient = getGeminiClient();
        let aiResponseText = '';

        if (aiClient) {
            console.log('Sending message to live Gemini API...');
            // Live Gemini API call
            const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
            
            // Format history
            const history = db.getChats(req.user.id).slice(-10).map(c => ({
                role: c.sender === 'user' ? 'user' : 'model',
                parts: [{ text: c.text }]
            }));

            // Start chat session
            const chatSession = model.startChat({
                history: history.slice(0, -1), // exclude the last added user message because we send it next
                systemInstruction: {
                    parts: [{ text: "You are FitGuru's premium AI fitness and diet coach. Respond in a friendly, conversational, encouraging, and human-like tone, just like a professional personal trainer. Provide comprehensive, structured, and practical advice on workouts and diet plans. Use normal paragraphs and readable lists rather than rigid robotic codes." }]
                }
            });

            const result = await chatSession.sendMessage(message);
            aiResponseText = result.response.text();
        } else {
            console.log('GEMINI_API_KEY not configured. Running offline rules engine...');
            // Fallback smart mock responses
            const lowerMsg = message.toLowerCase();
            const user = db.getUserById(req.user.id);
            const level = user ? user.level : 1;
            const baseCal = 2000 + (level * 50); // scales dynamically with athlete level
            const protein = Math.round((user ? user.prSquat || 150 : 150) * 0.9); // scales with strength PR
            const carbs = Math.round(baseCal * 0.5 / 4);
            const fats = Math.round(baseCal * 0.25 / 9);

            if (lowerMsg.includes('diet plan') || lowerMsg.includes('plan') || lowerMsg.includes('diet-plan')) {
                aiResponseText = `// JARVIS // SYSTEM_GENERATED_DIET_PLAN:
* TARGETS: ${baseCal} kcal | P: ${protein}g | C: ${carbs}g | F: ${fats}g
* MEAL 1 (08:00 - Pre-Workout): 3 Egg Whites / 100g Grilled Paneer + 1 Banana + 50g Oats in Milk.
* MEAL 2 (13:00 - Post-Workout): 150g Chicken Breast / 150g Tofu Stir-fry + 1 Bowl Brown Rice + Broccoli.
* MEAL 3 (17:30 - Mid-Day Refuel): 200g Fresh Curd + 15g Almonds + Sprouts Salad.
* MEAL 4 (20:30 - Sleep Lock): 1 Scoop Whey / Casein or 1 Glass Warm Milk + 3 Egg Whites.`;
            } else if (lowerMsg.includes('milk') || lowerMsg.includes('curd') || lowerMsg.includes('dairy')) {
                aiResponseText = `// JARVIS // DAIRY_DIAGNOSTICS:
* MILK: Premium source of casein & whey protein. Promotes bone density and muscle recovery.
* CURD: Rich in probiotics. Optimizes gut microbiome and enhances nutrient absorption.
* PROTOCOL: Take 250ml milk pre-sleep for sustained amino acid release during sleep-lock.`;
            } else if (lowerMsg.includes('paneer') || lowerMsg.includes('tofu') || lowerMsg.includes('soya')) {
                aiResponseText = `// JARVIS // VEG_PROTEIN_DIAGNOSTICS:
* PANEER: High in casein. Provides sustained protein release. Limit portion if cutting due to fats.
* TOFU: Excellent plant-based profile. Zero cholesterol, high iron and calcium.
* SOYA CHUNKS: Highly concentrated protein (52% by weight). Rich in BCAAs.`;
            } else if (lowerMsg.includes('egg') || lowerMsg.includes('chicken') || lowerMsg.includes('fish') || lowerMsg.includes('meat')) {
                aiResponseText = `// JARVIS // ANIMAL_PROTEIN_DIAGNOSTICS:
* EGG WHITES: Standard gold protein source. 100% bioavailable. 4g protein per egg white.
* CHICKEN BREAST: Ultra-lean protein. 31g protein per 100g. Minimal fat content.
* FISH: Rich in Omega-3 fatty acids (EPA/DHA). Reduces inflammation and supports joint health.`;
            } else if (lowerMsg.includes('banana') || lowerMsg.includes('apple') || lowerMsg.includes('fruit') || lowerMsg.includes('rice') || lowerMsg.includes('carb')) {
                aiResponseText = `// JARVIS // GLYCOGEN_ENERGY_DIAGNOSTICS:
* BANANA: Rapidly absorbing carbs. High in potassium. Ideal for pre-workout glycogen loading.
* BROWN RICE: Complex slow-release carbs. Sustains energy levels without insulin spikes.
* APPLE: Rich in pectin fiber. Slows digestion, providing stable, long-lasting energy.`;
            } else if (lowerMsg.includes('whey') || lowerMsg.includes('protein') || lowerMsg.includes('shake') || lowerMsg.includes('supplement')) {
                aiResponseText = `// JARVIS // SUPPLEMENTATION_DIAGNOSTICS:
* WHEY ISOLATE: High absorption rate. Ideal for post-workout window to trigger muscle synthesis.
* CREATINE MONOHYDRATE: Increases phosphocreatine stores. Elevates power output on heavy reps.
* GLUTAMINE: Supports gut barrier integrity and accelerates tissue recovery after workouts.`;
            } else if (lowerMsg.includes('squat')) {
                aiResponseText = `// JARVIS // SQUAT_DIAGNOSTICS:
* STANCE: Feet shoulder-width apart, toes flared 15-30°.
* DEPTH: Hit parallel (hips below knees) for maximum glute/quad recruitment.
* KNEE TRACKING: Push knees OUT ward, keeping them in line with toes.`;
            } else if (lowerMsg.includes('bench')) {
                aiResponseText = `// JARVIS // BENCH_PRESS_DIAGNOSTICS:
* GRIP: Just wider than shoulders. Keep wrists straight.
* BAR PATH: Touch lower chest/sternum, push up and back in a slight J-curve.
* LEG DRIVE: Push heels flat into the ground to lock in your back arch.`;
            } else if (lowerMsg.includes('eat') || lowerMsg.includes('diet') || lowerMsg.includes('calorie') || lowerMsg.includes('food')) {
                aiResponseText = `// JARVIS // NUTRITION_DIAGNOSTICS:
* PROTEIN: Aim for 1.6g - 2.2g per kg of bodyweight daily.
* CALORIES: Surplus (+300 kcal) for hypertrophy, deficit (-500 kcal) for fat loss.
* HYDRATION: Minimum 3.5 Liters daily to support muscle fiber recovery.`;
            } else if (lowerMsg.includes('hi') || lowerMsg.includes('hello') || lowerMsg.includes('hey')) {
                aiResponseText = `Hello Athlete! Systems initialized. Direct me to squats, bench press form, or meal nutrition details. What is our current objective?`;
            } else {
                aiResponseText = `// JARVIS // DEC_STREAM_STABLE:
* Objective received. Form adjustments and calorie calculations locked.
* Recommend maintaining a steady tempo on eccentrics (2s down).
* Keep training intensity high. Type "squats" or "bench" for detailed guides.`;
            }
        }

        // Save AI reply in DB
        const chatReply = await db.addChat(req.user.id, 'coach', aiResponseText);
        res.json(chatReply);

    } catch (err) {
        console.error('Chat API error:', err);
        res.status(500).json({ error: 'AI Coach failed to respond' });
    }
});

// 3. Get dynamic daily coaching briefing card text
router.get('/briefing', authenticateToken, async (req, res) => {
    try {
        const user = db.getUserById(req.user.id);
        const aiClient = getGeminiClient();
        let briefing = '';

        if (aiClient) {
            const model = aiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `Write a 2-line technical fitness briefing for an athlete. Username: ${user.username}, Streak: ${user.streak} days, Level: ${user.level}. Be motivating and high-tech, like a HUD interface message. Under 100 characters.`;
            const result = await model.generateContent(prompt);
            briefing = result.response.text();
        } else {
            briefing = `STREAK LOCKED: ${user.streak} DAYS. AI CLASSIFIER DETECTS OPTIMAL HORMONAL SYNC. INITIATING POWER HYPERTROPHY ROUTINE.`;
        }

        res.json({ briefing });
    } catch (err) {
        res.json({ briefing: "SYSTEM RUNNING STABLE. MAINTAIN HIGH TEMPO ON ECENTRIC REPS today." });
    }
});

// 4. Clear chat history for user
router.post('/clear', authenticateToken, async (req, res) => {
    try {
        db.data.chats = db.data.chats.filter(c => c.userId !== req.user.id);
        await db.save();
        res.json({ success: true });
    } catch (err) {
        console.error('Clear chat error:', err);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

module.exports = router;
