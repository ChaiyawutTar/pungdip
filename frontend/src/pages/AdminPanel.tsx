import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LockSwitch } from '../components/LockSwitch';
import { LogTable } from '../components/LogTable';
import {
    getStatus,
    getLogs,
    getPrizes,
    lockPrize,
    unlockPrize,
    resetStocks
} from '../api/client';
import type { Prize } from '../types';

export const AdminPanel = () => {
    const queryClient = useQueryClient();
    const [selectedPrize, setSelectedPrize] = useState<string>('MK_DUCK');

    // Queries
    const statusQuery = useQuery({
        queryKey: ['admin', 'status'],
        queryFn: getStatus,
        refetchInterval: 3000, // Refresh every 3 seconds
    });

    const logsQuery = useQuery({
        queryKey: ['admin', 'logs'],
        queryFn: () => getLogs(30),
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    const prizesQuery = useQuery({
        queryKey: ['admin', 'prizes'],
        queryFn: getPrizes,
    });

    // Mutations
    const lockMutation = useMutation({
        mutationFn: lockPrize,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'status'] });
        },
    });

    const unlockMutation = useMutation({
        mutationFn: unlockPrize,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'status'] });
        },
    });

    const resetMutation = useMutation({
        mutationFn: resetStocks,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'status'] });
            alert('✅ Reset สำเร็จ!');
        },
    });

    const isLocked = statusQuery.data?.lock?.is_locked ?? false;
    const lockedPrizeId = statusQuery.data?.lock?.locked_prize_id ?? '';
    const stocks = statusQuery.data?.stocks ?? [];
    const triggerablePrizes = prizesQuery.data?.filter((p: Prize) => p.is_triggered) ?? [];

    // Update selected prize when lock status changes
    useEffect(() => {
        if (lockedPrizeId) {
            setSelectedPrize(lockedPrizeId);
        }
    }, [lockedPrizeId]);

    const handleToggle = async (locked: boolean) => {
        if (locked) {
            await lockMutation.mutateAsync(selectedPrize);
        } else {
            await unlockMutation.mutateAsync();
        }
    };

    const handlePrizeChange = async (prizeId: string) => {
        setSelectedPrize(prizeId);
        if (isLocked) {
            await lockMutation.mutateAsync(prizeId);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold text-pangdip-brown">
                        🎛️ Admin Control Panel
                    </h1>
                    <p className="text-gray-600">Pangdip Lucky Draw - Staff Only</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Lock Control Card */}
                    <div className="admin-card">
                        <h2 className="text-xl font-display font-bold text-pangdip-brown mb-4">
                            🔒 Lock Reward Mode
                        </h2>

                        <div className="space-y-6">
                            {/* Toggle Switch */}
                            <LockSwitch
                                isLocked={isLocked}
                                onToggle={handleToggle}
                                disabled={lockMutation.isPending || unlockMutation.isPending}
                            />

                            {/* Prize Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    เลือกรางวัลที่จะ Lock
                                </label>
                                <select
                                    value={selectedPrize}
                                    onChange={(e) => handlePrizeChange(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-pangdip-custard
                    focus:border-pangdip-orange focus:outline-none
                    text-pangdip-brown font-body"
                                    disabled={lockMutation.isPending}
                                >
                                    {triggerablePrizes.map((prize: Prize) => (
                                        <option key={prize.id} value={prize.id}>
                                            {prize.name} (Stock: {
                                                stocks.find(s => s.prize_id === prize.id)?.stock ?? prize.stock
                                            })
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status indicator */}
                            {isLocked && (
                                <div className="bg-pangdip-orange/20 rounded-lg p-4 text-center">
                                    <p className="text-pangdip-brown font-bold">
                                        ⚡ รางวัลถัดไปจะเป็น: {lockedPrizeId}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stock Status Card */}
                    <div className="admin-card">
                        <h2 className="text-xl font-display font-bold text-pangdip-brown mb-4">
                            📦 Stock Status
                        </h2>

                        <div className="space-y-3">
                            {stocks.map((stock) => (
                                <div key={stock.prize_id} className="flex justify-between items-center">
                                    <span className="font-body">{stock.name}</span>
                                    <span className={`font-bold ${stock.stock <= 0 ? 'text-red-500' : 'text-green-600'
                                        }`}>
                                        {stock.stock} / {stock.max}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => resetMutation.mutate()}
                            disabled={resetMutation.isPending}
                            className="mt-6 w-full px-4 py-3 bg-red-500 hover:bg-red-600 
                text-white font-display font-bold rounded-lg
                transition-colors disabled:opacity-50"
                        >
                            {resetMutation.isPending ? 'Resetting...' : '🔄 Reset All Stocks'}
                        </button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="admin-card mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-display font-bold text-pangdip-brown">
                            📋 Live Logs
                        </h2>
                        <span className="text-sm text-gray-500">
                            Auto-refresh every 5s
                        </span>
                    </div>

                    <LogTable
                        logs={logsQuery.data || []}
                        isLoading={logsQuery.isLoading}
                    />
                </div>
            </div>
        </div>
    );
};
