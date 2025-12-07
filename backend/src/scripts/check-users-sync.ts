import dotenv from 'dotenv';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import dns from 'dns';

// Load environment variables
dotenv.config();

// Fix DNS resolution issues by forcing Google DNS
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    console.error('❌ Failed to apply DNS fix:', e);
}

async function checkAndSyncUsers() {
    try {
        console.log('🔍 Checking user synchronization...\n');

        // Initialize Firebase Admin
        if (!admin.apps.length) {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
        }

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

        await mongoose.connect(MONGODB_URI, { family: 4 }); // Force IPv4 just in case
        console.log(`✅ Connected to MongoDB. Database: ${mongoose.connection.db.databaseName}`);

        // Fetch all Firebase users
        console.log('📥 Fetching Firebase users...');
        const listUsersResult = await admin.auth().listUsers(1000);
        const firebaseUsers = listUsersResult.users;
        console.log(`   Found ${firebaseUsers.length} users in Firebase.`);

        // Fetch all MongoDB users
        console.log('📥 Fetching MongoDB users...');
        const mongoUsers = await User.find({});
        console.log(`   Found ${mongoUsers.length} users in MongoDB.`);
        mongoUsers.forEach(u => console.log(`   - DB User: ${u.email} (Firebase: ${u.firebaseUid}) [_id: ${u._id}]`));

        // Compare
        const mongoUserIds = new Set(mongoUsers.map(u => u.firebaseUid));
        const missingInMongo = firebaseUsers.filter(u => !mongoUserIds.has(u.uid));

        if (missingInMongo.length === 0) {
            console.log('\n✅ All Firebase users exist in MongoDB. No sync needed.');
        } else {
            console.log(`\n⚠️  Found ${missingInMongo.length} users missing in MongoDB:`);
            missingInMongo.forEach(u => console.log(`   - ${u.email} (${u.uid})`));

            console.log('\n🔄 Syncing missing users...');
            for (const fbUser of missingInMongo) {
                try {
                    await User.create({
                        firebaseUid: fbUser.uid,
                        email: fbUser.email,
                        displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
                        photoURL: fbUser.photoURL,
                        role: 'user', // Default role
                    });
                    console.log(`   ✅ Created: ${fbUser.email}`);
                } catch (err: any) {
                    console.error(`   ❌ Failed to create ${fbUser.email}:`, err.message);
                }
            }
            console.log('\n✨ Sync complete!');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

checkAndSyncUsers();
