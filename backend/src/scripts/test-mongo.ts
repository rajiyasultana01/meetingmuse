import mongoose from 'mongoose';
import dotenv from 'dotenv';

import dns from 'dns';

dotenv.config();

try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('✅ Applied DNS Fix: Forced Google DNS');
} catch (e) {
    console.error('❌ Failed to apply DNS fix:', e);
}

const MONGODB_URI = process.env.MONGODB_URI;

console.log('Testing MongoDB Connection...');
// Check for special characters in password
const uriParts = MONGODB_URI?.match(/:\/\/([^:]+):([^@]+)@/);
if (uriParts) {
    const password = uriParts[2];
    const specialChars = ['@', ':', '/', '?', '#', '[', ']'];
    const hasSpecial = specialChars.some(char => password.includes(char));
    if (hasSpecial) {
        console.warn('⚠️  WARNING: Password contains special characters that might need URL encoding!');
        console.warn('   If your password has @, :, /, ?, #, etc., please URL encode them.');
    } else {
        console.log('ℹ️  Password format looks okay (no obvious special chars).');
    }
}
console.log('URI:', MONGODB_URI?.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI!, { family: 4 })
    .then(() => {
        console.log('✅ Connection Successful!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ Connection Failed:', err);
        if (err.name === 'MongoServerSelectionError') {
            console.error('Details:', JSON.stringify(err, null, 2));
        }
        process.exit(1);
    });
