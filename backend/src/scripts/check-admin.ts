import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

dotenv.config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ role: 'admin' });
        console.log('Admin User found:', admin);

        const allUsers = await User.find({});
        console.log('Total users:', allUsers.length);
        allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkAdmin();
