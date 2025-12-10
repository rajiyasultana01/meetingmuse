import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address as an argument.');
    console.error('Usage: npx tsx src/scripts/promote-user.ts <email>');
    process.exit(1);
}

// Fix DNS resolution issues
import dns from 'dns';
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) { }

async function promoteUser() {
    try {
        console.log(`🔍 Looking for user: ${email}...`);

        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetingmind';
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            console.log('   Please ask the user to sign up / log in first to create their account.');
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`ℹ️  User ${email} is ALREADY an admin.`);
        } else {
            user.role = 'admin';
            await user.save();
            console.log(`✨ Success! User ${email} has been promoted to ADMIN.`);
        }

        console.log(`👤 Name: ${user.displayName || 'N/A'}`);
        console.log(`🆔 ID:   ${user._id}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

promoteUser();
