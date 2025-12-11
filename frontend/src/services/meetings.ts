import api from '@/services/api';

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
        // api instance handles base URL and Authorization token automatically
        const response = await api.get<MeetingsResponse>('/meetings', {
            params: {
                limit,
                offset,
            },
        });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/meetings/${id}`);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/meetings/${id}`);
        return response.data;
    },
};
