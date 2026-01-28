import { useState } from 'react';
import { SpinButton } from '../components/SpinButton';
import { PrizeModal } from '../components/PrizeModal';
import { useSpin } from '../hooks/useSpin';
import type { SpinResult } from '../types';

// Prize wheel segments - 6 segments (clockwise from top)
const WHEEL_SEGMENTS = [
    { id: 'MK_DUCK', label: 'บัตรเป็ด MK', color: '#FFD700', emoji: '🦆' },
    { id: 'STARBUCKS', label: 'Starbucks', color: '#00704A', emoji: '☕' },
    { id: 'GIVE_IG', label: 'แจก IG', color: '#E1306C', emoji: '📱' },
    { id: 'NOTHING', label: 'ไม่ได้อะไรเลย', color: '#95A5A6', emoji: '😢' },
    { id: 'DISCOUNT_05', label: 'ลด 5%', color: '#4ECDC4', emoji: '🏷️' },
    { id: 'DISCOUNT_10', label: 'ลด 10%', color: '#FF6B6B', emoji: '🎫' },
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
            setIsWheelSpinning(true);

            // Call API
            const result = await spinMutation.mutateAsync('');

            console.log('API Result:', result.result);

            // Find the segment index that matches the result
            const prizeIndex = WHEEL_SEGMENTS.findIndex(p => p.id === result.result);
            console.log('Prize Index:', prizeIndex);

            // Calculate rotation to land on this segment
            // Each segment is 60 degrees
            // We want the pointer (at top) to point to the center of the target segment
            const segmentAngle = 360 / WHEEL_SEGMENTS.length; // 60 degrees

            // The wheel rotates clockwise, so to land on segment N,
            // we need to rotate so that segment N is at the top (where the pointer is)
            // Segment 0 starts at 0 degrees (top-right in conic-gradient)
            // Conic gradient starts at 3 o'clock and goes clockwise
            // We need to offset by -90 to start at 12 o'clock (top)

            // For segment at index i, its center is at angle: i * 60 + 30 degrees from 3 o'clock
            // But conic gradient starts from 3 o'clock, so we need to adjust
            // The pointer is at top (12 o'clock = -90 degrees from 3 o'clock)

            // To make segment center point to top:
            // Rotation needed = -(segment center angle from top)
            // = -(i * 60 + 30 - 90) = 90 - i * 60 - 30 = 60 - i * 60
            // = (1 - i) * 60

            // Add multiple full rotations for animation
            const baseRotation = (1 - prizeIndex) * segmentAngle;
            const fullRotations = 360 * 6; // 6 full spins
            const targetAngle = fullRotations + baseRotation;

            // Reset and set new rotation
            setWheelRotation(prev => {
                // Normalize previous rotation to 0-360 range
                const normalized = prev % 360;
                return normalized + targetAngle;
            });

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
                    {/* Pointer at top */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
                        <div
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: '18px solid transparent',
                                borderRight: '18px solid transparent',
                                borderTop: '35px solid #4A2C2A',
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
                        {/* Wheel segments - conic gradient starts at 3 o'clock, goes clockwise */}
                        {/* Rotate container -90deg so first segment starts at top */}
                        <div
                            className="w-full h-full rounded-full"
                            style={{
                                background: `conic-gradient(from -90deg,
                                    ${WHEEL_SEGMENTS.map((seg, i) =>
                                    `${seg.color} ${i * (100 / 6)}% ${(i + 1) * (100 / 6)}%`
                                ).join(', ')}
                                )`,
                            }}
                        >
                            {/* Labels */}
                            {WHEEL_SEGMENTS.map((seg, i) => {
                                // Each segment is 60 degrees
                                // First segment center is at 30 degrees from top (clockwise)
                                const angle = i * 60 + 30;
                                const rad = (angle) * (Math.PI / 180);
                                const radius = 100;
                                const x = Math.sin(rad) * radius; // sin for x because we start from top
                                const y = -Math.cos(rad) * radius; // -cos for y because Y is inverted

                                return (
                                    <div
                                        key={seg.id}
                                        className="absolute font-bold text-center"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg)`,
                                            color: 'white',
                                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                            fontSize: '11px',
                                            lineHeight: '1.2',
                                        }}
                                    >
                                        <div className="text-2xl mb-1">{seg.emoji}</div>
                                        <div className="whitespace-nowrap">{seg.label}</div>
                                    </div>
                                );
                            })}
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
