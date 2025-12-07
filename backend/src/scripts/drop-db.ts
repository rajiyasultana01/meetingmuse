import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

// Fix DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.error('Failed to set DNS:', e);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function dropDatabase() {
    try {
        if (!MONGODB_URI) throw new Error('MONGODB_URI missing');

        console.log('Connecting to database to drop it...');
        await mongoose.connect(MONGODB_URI, { family: 4 });

        const dbName = mongoose.connection.db.databaseName;
        console.log(`Connected to: ${dbName}`);

        if (dbName === 'meetingmind') {
            console.log(`⚠️  DROPPING DATABASE: ${dbName}`);
            await mongoose.connection.db.dropDatabase();
            console.log('✅ Database dropped successfully.');
        } else {
            console.log(`❌ Safety check failed. Expected 'meetingmind', got '${dbName}'. NOT dropping.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

dropDatabase();
