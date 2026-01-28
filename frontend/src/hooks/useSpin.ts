import { useMutation } from '@tanstack/react-query';
import { spin } from '../api/client';
import type { SpinResult } from '../types';

export const useSpin = () => {
    return useMutation<SpinResult, Error, string>({
        mutationFn: (instagramId: string) => spin(instagramId),
    });
};
