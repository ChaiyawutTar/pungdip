import { useState } from 'react';
import { SpinButton } from '../components/SpinButton';
import { PrizeModal } from '../components/PrizeModal';
import { useSpin } from '../hooks/useSpin';
import type { SpinResult } from '../types';

// Prize wheel segments - 6 segments
const WHEEL_SEGMENTS = [
    { id: 'MK_DUCK', label: 'บัตรเป็ด MK', color: '#FFD700', emoji: '🦆' },
    { id: 'STARBUCKS', label: 'Starbucks 1000฿', color: '#00704A', emoji: '☕' },
    { id: 'DISCOUNT_10', label: 'ลด 10%', color: '#FF6B6B', emoji: '🎫' },
    { id: 'DISCOUNT_05', label: 'ลด 5%', color: '#4ECDC4', emoji: '🏷️' },
    { id: 'NOTHING', label: 'ไม่ได้อะไรเลย', color: '#95A5A6', emoji: '😢' },
    { id: 'GIVE_IG', label: 'แจก IG', color: '#E1306C', emoji: '📱' },
];

export const PublicGame = () => {
    const [showModal, setShowModal] = useState(false);
    const [prizeResult, setPrizeResult] = useState<SpinResult | null>(null);
    const [wheelRotation, setWheelRotation] = useState(0);
    const [isWheelSpinning, setIsWheelSpinning] = useState(false);

    const spinMutation = useSpin();

    const handleSpin = async () => {
        if (isWheelSpinning) return;

        try {
            // Start spinning animation
            setIsWheelSpinning(true);

            // Call API (pass empty string since IG not required)
            const result = await spinMutation.mutateAsync('');

            // Calculate target rotation based on result
            const prizeIndex = WHEEL_SEGMENTS.findIndex(
                p => result.result.startsWith(p.id.split('_')[0]) || result.result === p.id
            );
            const segmentAngle = 360 / WHEEL_SEGMENTS.length;
            const targetAngle = 360 * 6 + (360 - (prizeIndex * segmentAngle + segmentAngle / 2));

            setWheelRotation(prev => prev + targetAngle);
            setPrizeResult(result);

            // Show modal after wheel stops
            setTimeout(() => {
                setIsWheelSpinning(false);
                setShowModal(true);
            }, 4000);

        } catch (error) {
            console.error('Spin error:', error);
            setIsWheelSpinning(false);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPrizeResult(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl animate-float opacity-50">🥟</div>
            <div className="absolute top-20 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🍡</div>
            <div className="absolute bottom-10 right-10 text-6xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>🥟</div>

            {/* Main container */}
            <div className="text-center relative z-10 w-full max-w-lg">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-pangdip-brown mb-2">
                        🥟 PANGDIP 🥟
                    </h1>
                    <p className="text-pangdip-brown/70 font-body text-lg">
                        งานเกษตรแฟร์ 2569
                    </p>
                </div>

                {/* Spinning Wheel - Centered */}
                <div className="relative mb-8 flex justify-center">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
                        <div
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: '15px solid transparent',
                                borderRight: '15px solid transparent',
                                borderTop: '30px solid #4A2C2A',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            }}
                        />
                    </div>

                    {/* Wheel */}
                    <div
                        className="w-80 h-80 rounded-full relative shadow-2xl"
                        style={{
                            border: '8px solid #4A2C2A',
                            transform: `rotate(${wheelRotation}deg)`,
                            transition: isWheelSpinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                        }}
                    >
                        {/* Wheel segments using conic gradient */}
                        <div
                            className="w-full h-full rounded-full"
                            style={{
                                background: `conic-gradient(
                                    ${WHEEL_SEGMENTS.map((seg, i) =>
                                    `${seg.color} ${i * (100 / 6)}% ${(i + 1) * (100 / 6)}%`
                                ).join(', ')}
                                )`,
                            }}
                        >
                            {/* Labels - using SVG for proper radial text */}
                            <svg viewBox="0 0 300 300" className="absolute inset-0 w-full h-full">
                                {WHEEL_SEGMENTS.map((seg, i) => {
                                    const angle = (i * 60) + 30; // Center of segment
                                    const rad = (angle - 90) * (Math.PI / 180); // Convert to radians, offset to start from top
                                    const radius = 110;
                                    const x = 150 + Math.cos(rad) * radius;
                                    const y = 150 + Math.sin(rad) * radius;

                                    return (
                                        <g key={seg.id} transform={`rotate(${angle}, ${x}, ${y})`}>
                                            <text
                                                x={x}
                                                y={y - 10}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="24"
                                                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                                            >
                                                {seg.emoji}
                                            </text>
                                            <text
                                                x={x}
                                                y={y + 12}
                                                textAnchor="middle"
                                                fill="white"
                                                fontSize="11"
                                                fontWeight="bold"
                                                style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}
                                            >
                                                {seg.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>

                        {/* Center circle */}
                        <div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full shadow-lg z-10 flex items-center justify-center overflow-hidden"
                            style={{
                                background: '#F6E58D',
                                border: '4px solid #4A2C2A',
                            }}
                        >
                            <img src="/bread.png" alt="Pangdip" className="w-16 h-16 object-contain" />
                        </div>
                    </div>
                </div>

                {/* Spin Button */}
                <div className="flex justify-center mb-4">
                    <SpinButton
                        onClick={handleSpin}
                        isLoading={isWheelSpinning}
                        disabled={isWheelSpinning}
                    />
                </div>

                {/* Instructions */}
                <p className="text-sm text-pangdip-brown/60 font-body">
                    กดหมุนลุ้นรางวัล! 🎉
                </p>
            </div>

            {/* Prize Modal */}
            <PrizeModal
                isOpen={showModal}
                onClose={handleCloseModal}
                prize={prizeResult}
            />
        </div>
    );
};
