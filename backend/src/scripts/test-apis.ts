import dotenv from 'dotenv';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import dns from 'dns';

dotenv.config();

// Fix DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.error('Failed to set DNS:', e);
}

async function testApis() {
    console.log('🔍 Testing External APIs...\n');

    // 1. Test OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
        console.log('❌ OpenAI: Key Missing');
    } else {
        try {
            const openai = new OpenAI({ apiKey: openaiKey });
            await openai.models.list();
            console.log('✅ OpenAI: Connection Successful');
        } catch (error: any) {
            console.log(`❌ OpenAI: Failed - ${error.message}`);
        }
    }

    // 2. Test Groq
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        console.log('❌ Groq: Key Missing (Required for Summarization)');
    } else {
        try {
            const groq = new Groq({ apiKey: groqKey });
            await groq.models.list();
            console.log('✅ Groq: Connection Successful');
        } catch (error: any) {
            console.log(`❌ Groq: Failed - ${error.message}`);
        }
    }

    process.exit(0);
}

testApis();
