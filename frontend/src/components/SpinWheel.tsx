import { useState, useRef } from 'react';

interface SpinWheelProps {
    onSpinComplete: () => void;
    isSpinning: boolean;
    result: string | null;
}

const PRIZES = [
    { id: 'MK_DUCK', label: 'บัตร MK', color: '#FFD700', emoji: '🦆' },
    { id: 'STARBUCKS', label: 'Starbucks', color: '#00704A', emoji: '☕' },
    { id: 'DISCOUNT_10', label: 'ลด 10%', color: '#FF6B6B', emoji: '🎫' },
    { id: 'DISCOUNT_05', label: 'ลด 5%', color: '#4ECDC4', emoji: '🏷️' },
    { id: 'NOTHING', label: 'เสียใจด้วย', color: '#95A5A6', emoji: '😢' },
    { id: 'NOTHING2', label: 'ลองใหม่นะ', color: '#BDC3C7', emoji: '🍀' },
];

export const SpinWheel = ({ onSpinComplete, isSpinning, result }: SpinWheelProps) => {
    const [rotation, setRotation] = useState(0);
    const wheelRef = useRef<HTMLDivElement>(null);

    // Calculate rotation when result comes in
    const getResultRotation = (resultId: string) => {
        const prizeIndex = PRIZES.findIndex(p => p.id === resultId || p.id.startsWith(resultId.split('_')[0]));
        const segmentAngle = 360 / PRIZES.length;
        // Spin multiple times + land on the prize
        const targetAngle = 360 * 5 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));
        return targetAngle;
    };

    // Trigger spin animation when isSpinning changes
    if (isSpinning && result) {
        const targetRotation = rotation + getResultRotation(result);
        if (wheelRef.current) {
            wheelRef.current.style.transform = `rotate(${targetRotation}deg)`;
        }
        setTimeout(() => {
            setRotation(targetRotation);
            onSpinComplete();
        }, 4000);
    }

    return (
        <div className="relative w-80 h-80 mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-pangdip-brown shadow-lg" />
            </div>

            {/* Wheel */}
            <div
                ref={wheelRef}
                className="w-full h-full rounded-full relative overflow-hidden shadow-2xl border-8 border-pangdip-brown"
                style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
            >
                {PRIZES.map((prize, index) => {
                    const segmentAngle = 360 / PRIZES.length;
                    const startAngle = index * segmentAngle;

                    return (
                        <div
                            key={prize.id}
                            className="absolute w-1/2 h-1/2 origin-bottom-right"
                            style={{
                                transform: `rotate(${startAngle}deg) skewY(${90 - segmentAngle}deg)`,
                                backgroundColor: prize.color,
                                left: '0',
                                top: '0',
                            }}
                        >
                            <div
                                className="absolute text-white font-bold text-sm"
                                style={{
                                    transform: `skewY(${-(90 - segmentAngle)}deg) rotate(${segmentAngle / 2}deg)`,
                                    left: '50%',
                                    top: '30%',
                                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                }}
                            >
                                <span className="text-2xl">{prize.emoji}</span>
                                <br />
                                <span className="text-xs">{prize.label}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-pangdip-custard border-4 border-pangdip-brown shadow-lg z-10 flex items-center justify-center">
                    <span className="text-2xl">🥟</span>
                </div>
            </div>
        </div>
    );
};
