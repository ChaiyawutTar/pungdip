import { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { SpinButton } from '../components/SpinButton';
import { PrizeModal } from '../components/PrizeModal';
import { useSpin } from '../hooks/useSpin';
import type { SpinResult } from '../types';

// Prize wheel segments - Must match backend order!
const WHEEL_SEGMENTS = [
    { id: 'MK_DUCK', label: 'บัตรเป็ด MK', color: '#FFD700', emoji: '🦆' },
    { id: 'STARBUCKS', label: 'Starbucks 1000฿', color: '#00704A', emoji: '☕' },
    { id: 'DISCOUNT_10', label: 'ลด 10%', color: '#FF6B6B', emoji: '🎫' },
    { id: 'DISCOUNT_05', label: 'ลด 5%', color: '#4ECDC4', emoji: '🏷️' },
    { id: 'FREE_FOOD', label: 'กินฟรี', color: '#FF9500', emoji: '🍜' },
    { id: 'NOTHING', label: 'เสียใจด้วย', color: '#95A5A6', emoji: '😢' },
    { id: 'GIVE_IG', label: 'แจก IG', color: '#E1306C', emoji: '📱' },
];

const wheelData = WHEEL_SEGMENTS.map(seg => ({
    option: seg.label,
    style: { backgroundColor: seg.color, textColor: 'white' },
    // We can add image here if the library supports it, but text is fine for now
    // Some versions support 'image' prop in data.
}));

export const PublicGame = () => {
    const [showModal, setShowModal] = useState(false);
    const [prizeResult, setPrizeResult] = useState<SpinResult | null>(null);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);

    const spinMutation = useSpin();

    const handleSpinClick = async () => {
        if (mustSpin) return;

        try {
            // 1. Call API
            const result = await spinMutation.mutateAsync('');
            console.log('API Result:', result);

            // 2. Find index
            const newPrizeNumber = WHEEL_SEGMENTS.findIndex(p => p.id === result.result);
            if (newPrizeNumber === -1) {
                alert('Error: Invalid prize result');
                return;
            }

            // 3. Start spinning
            setPrizeResult(result);
            setPrizeNumber(newPrizeNumber);
            setMustSpin(true);

        } catch (error) {
            console.error('Spin error:', error);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleStopSpinning = () => {
        setMustSpin(false);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPrizeResult(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-[#FFF5E6]">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl animate-float opacity-50">🥟</div>
            <div className="absolute top-20 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🍡</div>
            <div className="absolute bottom-10 right-10 text-6xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>🥟</div>

            {/* Main container */}
            <div className="text-center relative z-10 w-full max-w-lg flex flex-col items-center">
                <div className="mb-12">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-pangdip-brown mb-2">
                       🍞 PANGDIP 🍞
                    </h1>
                    <p className="text-pangdip-brown/70 font-body text-lg">
                        งานเกษตรแฟร์ 2569
                    </p>
                </div>

                {/* React Custom Roulette */}
                <div className="mb-8 relative filter drop-shadow-xl">
                    <Wheel
                        mustStartSpinning={mustSpin}
                        prizeNumber={prizeNumber}
                        data={wheelData}
                        onStopSpinning={handleStopSpinning}

                        // Styling matches Pangdip theme
                        radiusLineColor="#4A2C2A"
                        radiusLineWidth={2}
                        outerBorderColor="#4A2C2A"
                        outerBorderWidth={8}
                        innerRadius={15}
                        innerBorderColor="#4A2C2A"
                        innerBorderWidth={4}

                        fontSize={16}
                        textDistance={65}

                        // Center dot style
                        perpendicularText={true}
                        backgroundColors={['#FFFFFF']} // fallback
                        textColors={['#FFFFFF']} // default white text
                    />
                </div>

                {/* Spin Button */}
                <div className="flex justify-center mt-4 mb-4">
                    <SpinButton
                        onClick={handleSpinClick}
                        isLoading={mustSpin || spinMutation.isPending}
                        disabled={mustSpin || spinMutation.isPending}
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
