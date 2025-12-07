import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';
import { Transcript } from '../models/Transcript.js';
import { Summary } from '../models/Summary.js';
import { MeetingAnalytics } from '../models/MeetingAnalytics.js';

dotenv.config();

// Fix DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.error('Failed to set DNS:', e);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

        console.log('🌱 Connecting to database...');
        await mongoose.connect(MONGODB_URI, { family: 4 });
        console.log(`✅ Connected to: ${mongoose.connection.db.databaseName}`);

        // 1. Find a user
        const user = await User.findOne({});
        if (!user) {
            throw new Error('No users found! Please run the sync script first.');
        }
        console.log(`👤 Found user: ${user.email}`);

        // 2. Create a Meeting
        console.log('Creating sample meeting...');
        const meeting = await Meeting.create({
            userId: user._id,
            firebaseUid: user.firebaseUid,
            title: 'Welcome to MeetingMuse',
            description: 'This is a sample meeting to initialize your database collections.',
            videoPath: 'sample/path/video.mp4',
            videoUrl: 'https://example.com/sample-video.mp4',
            source: 'manual-upload',
            status: 'completed',
            durationSeconds: 120,
        });
        console.log('✅ Created Meeting');

        // 3. Create a Transcript
        console.log('Creating sample transcript...');
        const transcript = await Transcript.create({
            meetingId: meeting._id,
            rawTranscript: "Hello everyone, welcome to MeetingMuse. This is a sample transcript.",
            wordCount: 10,
            language: 'en',
        });
        console.log('✅ Created Transcript');

        // 4. Create a Summary
        console.log('Creating sample summary...');
        await Summary.create({
            meetingId: meeting._id,
            transcriptId: transcript._id,
            summaryText: "This is a summary of the welcome meeting.",
            keyPoints: ["Welcome to the app", "Database initialized"],
            actionItems: ["Explore the features"],
            sentiment: 'positive',
        });
        console.log('✅ Created Summary');

        // 5. Create Analytics
        console.log('Creating sample analytics...');
        await MeetingAnalytics.create({
            meetingId: meeting._id,
            userId: user._id,
            viewCount: 1,
        });
        console.log('✅ Created Analytics');

        console.log('\n✨ Seeding complete! All collections should now be visible.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedData();
