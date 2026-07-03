require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('API Key present:', !!process.env.GEMINI_API_KEY);
console.log('API Key value:', process.env.GEMINI_API_KEY);

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Hello, are you ready to coach? Respond in a short sentence.');
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Gemini Test Error:', err);
  }
}

test();
