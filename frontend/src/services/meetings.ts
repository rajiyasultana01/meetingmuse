import axios from 'axios';
import { auth } from '@/config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Meeting {
    _id: string;
    title: string;
    date: string;
    duration?: string;
    participants?: number;
    summary?: string;
    tags?: string[];
    status: 'processing' | 'completed' | 'failed' | 'uploaded';
    createdAt: string;
}

export interface MeetingsResponse {
    meetings: Meeting[];
    total: number;
    limit: number;
    offset: number;
}

export const meetingsAPI = {
    getAll: async (limit = 20, offset = 0) => {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.get<MeetingsResponse>(`${API_URL}/meetings`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                limit,
                offset,
            },
        });
        return response.data;
    },

    getById: async (id: string) => {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.get(`${API_URL}/meetings/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    delete: async (id: string) => {
        const token = await auth.currentUser?.getIdToken();
        const response = await axios.delete(`${API_URL}/meetings/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },
};
