import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

console.log('Testing Native MongoDB Driver...');
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
});

async function run() {
    try {
        console.log('Attempting to connect...');
        await client.connect();
        console.log('✅ Connected successfully to server');

        const db = client.db();
        console.log(`Using database: ${db.databaseName}`);

        console.log('Pinging deployment...');
        await db.command({ ping: 1 });
        console.log('✅ Ping successful');

    } catch (err) {
        console.error('❌ Connection Failed:', err);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
