import axios, { type AxiosInstance } from 'axios';
import type {
    SpinResult,
    APIResponse,
    SpinLog,
    AdminStatus,
    Prize
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Public API
export const spin = async (instagramId: string): Promise<SpinResult> => {
    const response = await api.post<SpinResult>('/api/spin', {
        instagram_id: instagramId,
    });
    return response.data;
};

// Admin API
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || 'admin_password';

export const lockPrize = async (prizeId: string): Promise<APIResponse> => {
    const response = await api.post<APIResponse>('/api/admin/lock', {
        prize_id: prizeId,
        secret: ADMIN_SECRET,
    });
    return response.data;
};

export const unlockPrize = async (): Promise<APIResponse> => {
    const response = await api.post<APIResponse>('/api/admin/unlock', {
        secret: ADMIN_SECRET,
    });
    return response.data;
};

export const resetStocks = async (): Promise<APIResponse> => {
    const response = await api.post<APIResponse>('/api/admin/reset', {
        secret: ADMIN_SECRET,
    });
    return response.data;
};

export const getLogs = async (limit: number = 50): Promise<SpinLog[]> => {
    const response = await api.get<APIResponse<SpinLog[]>>('/api/admin/logs', {
        params: { limit },
    });
    return response.data.data || [];
};

export const getStatus = async (): Promise<AdminStatus> => {
    const response = await api.get<APIResponse<AdminStatus>>('/api/admin/status');
    return response.data.data!;
};

export const getStats = async (): Promise<Record<string, unknown>> => {
    const response = await api.get<APIResponse<Record<string, unknown>>>('/api/admin/stats');
    return response.data.data || {};
};

export const getPrizes = async (): Promise<Prize[]> => {
    const response = await api.get<APIResponse<Prize[]>>('/api/admin/prizes');
    return response.data.data || [];
};

export default api;
