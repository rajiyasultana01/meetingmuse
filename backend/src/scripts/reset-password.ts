import dotenv from 'dotenv';
import admin from 'firebase-admin';

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = 'admin@lexdatalabs.com';
const NEW_PASSWORD = 'lexdatalabs';

async function resetAdminPassword() {
    try {
        console.log('🔧 Starting password reset...\n');

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

        // Check if user exists
        try {
            const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
            console.log(`✅ User found: ${user.email} (${user.uid})`);

            // Update password
            console.log(`📝 Updating password...`);
            await admin.auth().updateUser(user.uid, {
                password: NEW_PASSWORD,
            });
            console.log(`✅ Password updated successfully to: ${NEW_PASSWORD}`);

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`❌ User ${ADMIN_EMAIL} not found in Firebase!`);
                console.log('Creating user now...');

                const user = await admin.auth().createUser({
                    email: ADMIN_EMAIL,
                    password: NEW_PASSWORD,
                    emailVerified: true,
                    displayName: 'LexDataLabs Admin'
                });
                console.log(`✅ User created with UID: ${user.uid}`);
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

resetAdminPassword();
