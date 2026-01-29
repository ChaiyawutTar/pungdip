import { useEffect, useState } from 'react';
import type { PrizeModalProps } from '../types';

// Thai prize display info
const PRIZE_INFO: Record<string, { emoji: string; name: string; isWin: boolean; message?: string }> = {
    MK_DUCK: { emoji: '🦆', name: 'บัตรเป็ด MK', isWin: true, message: 'กรุณาแคปหน้าจอนี้แสดงกับพนักงาน' },
    STARBUCKS: { emoji: '☕', name: 'Starbucks Giftcard 1000 บาท', isWin: true, message: 'กรุณาแคปหน้าจอนี้แสดงกับพนักงาน' },
    DISCOUNT_10: { emoji: '🎫', name: 'ส่วนลด 10%', isWin: true, message: 'กรุณาแคปหน้าจอนี้แสดงกับพนักงาน' },
    DISCOUNT_05: { emoji: '🏷️', name: 'ส่วนลด 5%', isWin: true, message: 'กรุณาแคปหน้าจอนี้แสดงกับพนักงาน' },
    FREE_FOOD: { emoji: '🍜', name: 'กินฟรี', isWin: true, message: 'กรุณาแคปหน้าจอนี้แสดงกับพนักงาน' },
    GIVE_IG: { emoji: '📱', name: 'แจก IG ให้พี่ๆ', isWin: false, message: 'โปรดแจ้ง IG ให้พนักงานจดบันทึก' },
    NOTHING: { emoji: '😢', name: 'ไม่ได้อะไรเลย', isWin: false },
};

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

    const info = PRIZE_INFO[prize.result] || { emoji: '🎁', name: prize.prize_name, isWin: false };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="card-warm p-16 max-w-xl mx-4 text-center relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Confetti effect */}
                {showConfetti && info.isWin && (
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
                    <div className={`text-9xl mb-6 ${info.isWin ? 'animate-bounce' : ''}`}>
                        {info.emoji}
                    </div>

                    <h2 className={`text-3xl font-display font-bold mb-4 ${info.isWin ? 'text-pangdip-orange' : 'text-pangdip-brown'}`}>
                        {info.isWin ? '🎊 ยินดีด้วย! 🎊' : info.name}
                    </h2>

                    {info.isWin && (
                        <p className="text-xl text-pangdip-brown font-body mb-4">
                            คุณได้รับ {info.name}
                        </p>
                    )}

                    {info.message && (
                        <p className="text-lg text-pangdip-brown/70 mb-8 bg-pangdip-custard/50 p-5 rounded-xl">
                            📸 {info.message}
                        </p>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="btn-spin px-16 py-5 text-2xl rounded-full"
                >
                    ปิด
                </button>
            </div>
        </div>
    );
};
