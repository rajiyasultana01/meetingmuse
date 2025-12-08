import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Meeting } from '../models/Meeting.js';

dotenv.config();

async function checkMeetings() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ Connected to MongoDB\n');

        // Find admin user
        const admin = await User.findOne({ email: 'admin@lexdatalabs.com' });
        console.log('Admin User:');
        console.log('  _id:', admin?._id);
        console.log('  email:', admin?.email);
        console.log('  firebaseUid:', admin?.firebaseUid);
        console.log('  role:', admin?.role);
        console.log('');

        // Find all meetings
        const allMeetings = await Meeting.find({});
        console.log(`Total Meetings: ${allMeetings.length}\n`);

        allMeetings.forEach((m, i) => {
            console.log(`Meeting ${i + 1}:`);
            console.log('  _id:', m._id);
            console.log('  title:', m.title);
            console.log('  userId:', m.userId);
            console.log('  firebaseUid:', m.firebaseUid);
            console.log('  status:', m.status);
            console.log('');
        });

        // Check if admin's meetings exist
        if (admin) {
            const adminMeetings = await Meeting.find({ userId: admin._id });
            console.log(`Admin's Meetings (by userId): ${adminMeetings.length}`);
            const adminMeetingsByFirebase = await Meeting.find({ firebaseUid: admin.firebaseUid });
            console.log(`Admin's Meetings (by firebaseUid): ${adminMeetingsByFirebase.length}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkMeetings();
