import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = 'admin@lexdatalabs.com';
const ADMIN_NAME = 'LexDataLabs Admin';

async function syncAdminUser() {
    try {
        console.log('🔧 Starting MongoDB sync for admin user...\n');

        // Initialize Firebase Admin to get UID
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

        // Get Firebase User
        const firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
        console.log(`✅ Found Firebase User: ${firebaseUser.email} (${firebaseUser.uid})`);

        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) throw new Error('MONGODB_URI is missing in .env');

        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find and update, or create user in MongoDB
        const user = await User.findOneAndUpdate(
            { email: ADMIN_EMAIL },
            {
                firebaseUid: firebaseUser.uid,
                email: ADMIN_EMAIL,
                displayName: ADMIN_NAME,
                role: 'admin',
                photoURL: firebaseUser.photoURL || ''
            },
            { new: true, upsert: true } // Create if not exists
        );

        console.log('✅ MongoDB User Updated Successfully:');
        console.log(JSON.stringify(user, null, 2));

    } catch (error) {
        console.error('❌ Error syncing admin:', error);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

syncAdminUser();
