import { useEffect, useState } from 'react';
import type { PrizeModalProps } from '../types';
import { PRIZE_DISPLAY } from '../types';

export const PrizeModal = ({ isOpen, onClose, prize }: PrizeModalProps) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isOpen && prize) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, prize]);

    if (!isOpen || !prize) return null;

    const prizeInfo = PRIZE_DISPLAY[prize.result] || { emoji: '🎁', color: 'text-pangdip-orange' };
    const isWin = prize.result !== 'NOTHING';

    // Thai prize names
    const thaiPrizeNames: Record<string, string> = {
        MK_DUCK: '🦆 บัตรเป็ด MK',
        STARBUCKS: '☕ Starbucks 1,000 บาท',
        DISCOUNT_10: '🎫 ส่วนลด 10%',
        DISCOUNT_05: '🏷️ ส่วนลด 5%',
        NOTHING: '😢 เสียใจด้วยนะ',
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="card-warm p-8 max-w-md mx-4 text-center relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Confetti effect */}
                {showConfetti && isWin && (
                    <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-confetti"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            >
                                {['🎉', '✨', '🎊', '⭐'][Math.floor(Math.random() * 4)]}
                            </div>
                        ))}
                    </div>
                )}

                {/* Prize reveal */}
                <div className="prize-reveal">
                    <div className={`text-8xl mb-4 ${isWin ? 'animate-bounce' : ''}`}>
                        {prizeInfo.emoji}
                    </div>

                    <h2 className={`text-2xl font-display font-bold mb-2 ${prizeInfo.color}`}>
                        {isWin ? '🎊 ยินดีด้วย! 🎊' : 'เสียใจด้วยนะ 😢'}
                    </h2>

                    <p className="text-xl text-pangdip-brown font-body mb-4">
                        {thaiPrizeNames[prize.result] || prize.prize_name}
                    </p>

                    {isWin && (
                        <p className="text-sm text-pangdip-brown/70 mb-6 bg-pangdip-custard/50 p-3 rounded-lg">
                            📸 กรุณาแคปหน้าจอนี้แสดงกับพนักงาน
                        </p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="btn-spin px-8 py-3 text-lg"
                >
                    ปิด
                </button>
            </div>
        </div>
    );
};
