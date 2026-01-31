import { useState } from 'react';
import { SpinWheel } from '../components/SpinWheel';
import { PrizeModal } from '../components/PrizeModal';
import { useSpin } from '../hooks/useSpin';
import type { SpinResult } from '../types';

export const PublicGame = () => {
    const [showModal, setShowModal] = useState(false);
    const [prizeResult, setPrizeResult] = useState<SpinResult | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const spinMutation = useSpin();

    const handleSpinClick = async () => {
        if (isSpinning) return;

        try {
            // 1. Call API
            const apiResult = await spinMutation.mutateAsync('');
            console.log('API Result:', apiResult);

            // 2. Store result and start spinning
            setPrizeResult(apiResult);
            setResult(apiResult.result);
            setIsSpinning(true);

            // 3. Wait for animation to complete
            setTimeout(() => {
                setIsSpinning(false);
                setShowModal(true);
            }, 4000);

        } catch (error) {
            console.error('Spin error:', error);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPrizeResult(null);
        setResult(null);
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

                {/* Custom Spin Wheel with variable-sized sections */}
                <div className="mb-8 relative">
                    <SpinWheel
                        onSpin={handleSpinClick}
                        isSpinning={isSpinning}
                        result={result}
                        disabled={spinMutation.isPending}
                    />
                </div>

                {/* Instructions */}
                <p className="text-sm text-pangdip-brown/60 font-body mt-4">
                    กดตรงกลางวงล้อเพื่อหมุนลุ้นรางวัล! 🎉
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
