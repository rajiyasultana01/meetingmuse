import dotenv from 'dotenv';
import admin from 'firebase-admin';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

dotenv.config();

async function testAuthenticatedUpload() {
    try {
        console.log('🔧 Testing authenticated extension upload...\n');

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

        // Create a custom token for the admin user
        const adminEmail = 'admin@lexdatalabs.com';
        const adminUser = await admin.auth().getUserByEmail(adminEmail);
        const customToken = await admin.auth().createCustomToken(adminUser.uid);

        console.log('✅ Created custom token for:', adminEmail);
        console.log('   UID:', adminUser.uid);
        console.log('   Token:', customToken.substring(0, 20) + '...\n');

        // Exchange custom token for ID token (this simulates what the extension would do)
        const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyCRQNQkhEnHJR7S9p8wfHaVyXaLgt0AI2U';
        const tokenResponse = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
            {
                token: customToken,
                returnSecureToken: true,
            }
        );

        const idToken = tokenResponse.data.idToken;
        console.log('✅ Exchanged for ID token:', idToken.substring(0, 20) + '...\n');

        // Create a test file if it doesn't exist
        const testFile = 'test-video.webm';
        if (!fs.existsSync(testFile)) {
            fs.writeFileSync(testFile, 'fake webm content');
        }

        // Upload using the authenticated endpoint
        const form = new FormData();
        form.append('video', fs.createReadStream(testFile), {
            filename: 'test-video.webm',
            contentType: 'video/webm',
        });
        form.append('title', 'Test Authenticated Upload');

        console.log('📤 Uploading to /api/meetings/upload-extension-auth...\n');

        const uploadResponse = await axios.post(
            'http://localhost:5000/api/meetings/upload-extension-auth',
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    'Authorization': `Bearer ${idToken}`,
                },
            }
        );

        console.log('✅ Upload successful!');
        console.log('   Response:', JSON.stringify(uploadResponse.data, null, 2));

    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testAuthenticatedUpload();
