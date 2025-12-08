import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

async function fixAdminRole() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB');

        const result = await User.updateOne(
            { email: 'admin@lexdatalabs.com' },
            { $set: { role: 'admin' } }
        );

        console.log('Update result:', result);

        const admin = await User.findOne({ email: 'admin@lexdatalabs.com' });
        console.log('✅ Admin user updated:', { email: admin?.email, role: admin?.role });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixAdminRole();
