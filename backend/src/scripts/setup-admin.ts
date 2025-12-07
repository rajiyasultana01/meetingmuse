import dotenv from 'dotenv';
import admin from 'firebase-admin';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

// Load environment variables
dotenv.config();

// Fix DNS resolution issues by forcing Google DNS
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log('✅ Applied DNS Fix: Forced Google DNS');
} catch (e) {
  console.error('❌ Failed to apply DNS fix:', e);
}

const ADMIN_EMAIL = 'admin@lexdatalabs.com';
const ADMIN_PASSWORD = 'lexdatalabs';
const ADMIN_NAME = 'LexDataLabs Admin';

async function setupAdmin() {
  try {
    console.log('🔧 Starting admin setup...\n');

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
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meetingmind';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin user already exists in Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`ℹ️  Firebase user with email ${ADMIN_EMAIL} already exists`);
      console.log(`   UID: ${firebaseUser.uid}\n`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create Firebase user
        console.log(`📝 Creating Firebase user: ${ADMIN_EMAIL}`);
        firebaseUser = await admin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_NAME,
          emailVerified: true,
        });
        console.log(`✅ Firebase user created successfully`);
        console.log(`   UID: ${firebaseUser.uid}\n`);
      } else {
        throw error;
      }
    }

    // Check if user exists in MongoDB
    let mongoUser = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (mongoUser) {
      console.log(`ℹ️  MongoDB user already exists`);
      if (mongoUser.role !== 'admin') {
        // Update role to admin
        console.log(`📝 Updating user role to admin...`);
        mongoUser.role = 'admin';
        await mongoUser.save();
        console.log(`✅ User role updated to admin\n`);
      } else {
        console.log(`   User already has admin role\n`);
      }
    } else {
      // Create MongoDB user with admin role
      console.log(`📝 Creating MongoDB user with admin role...`);
      mongoUser = await User.create({
        firebaseUid: firebaseUser.uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_NAME,
        role: 'admin',
      });
      console.log(`✅ MongoDB user created successfully\n`);
    }

    console.log('═══════════════════════════════════════');
    console.log('✨ Admin account setup complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📧 Email:    ${ADMIN_EMAIL}`);
    console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
    console.log(`👤 Role:     ${mongoUser.role}`);
    console.log(`🆔 UID:      ${firebaseUser.uid}`);
    console.log('═══════════════════════════════════════\n');

    console.log('ℹ️  You can now log in to the application with these credentials.');
    console.log('   The admin will be redirected to /admin after login.\n');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  }
}

setupAdmin();
