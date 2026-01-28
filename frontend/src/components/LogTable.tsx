import type { LogTableProps } from '../types';
import { PRIZE_DISPLAY } from '../types';

export const LogTable = ({ logs, isLoading }: LogTableProps) => {
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        );
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">📋</span>
                <p>ยังไม่มีข้อมูล</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-xl">
            <table className="table-warm">
                <thead>
                    <tr>
                        <th className="rounded-tl-xl">IG</th>
                        <th>รางวัล</th>
                        <th>เวลา</th>
                        <th className="rounded-tr-xl">Lock</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => {
                        const prizeInfo = PRIZE_DISPLAY[log.prize_won] || { emoji: '🎁', color: 'text-gray-500' };
                        return (
                            <tr key={log.id} className="hover:bg-pangdip-custard/10">
                                <td className="font-mono text-sm">@{log.instagram_id}</td>
                                <td>
                                    <span className="flex items-center gap-2">
                                        <span>{prizeInfo.emoji}</span>
                                        <span className={prizeInfo.color}>{log.prize_name}</span>
                                    </span>
                                </td>
                                <td className="text-sm text-gray-600">{formatTime(log.timestamp)}</td>
                                <td>
                                    {log.was_locked && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pangdip-orange/20 text-pangdip-brown">
                                            🔒 Locked
                                        </span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
