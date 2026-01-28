import { useState } from 'react';
import { SpinButton } from '../components/SpinButton';
import { PrizeModal } from '../components/PrizeModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useSpin } from '../hooks/useSpin';
import type { SpinResult } from '../types';

export const PublicGame = () => {
    const [igAccount, setIgAccount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [prizeResult, setPrizeResult] = useState<SpinResult | null>(null);

    const spinMutation = useSpin();

    const handleSpin = async () => {
        if (!igAccount.trim()) {
            alert('กรุณากรอก IG Account');
            return;
        }

        try {
            const result = await spinMutation.mutateAsync(igAccount.trim());
            setPrizeResult(result);
            setShowModal(true);
        } catch (error) {
            console.error('Spin error:', error);
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setPrizeResult(null);
        setIgAccount('');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
            {/* Decorative elements */}
            <div className="absolute top-10 left-10 text-6xl animate-float opacity-50">🥟</div>
            <div className="absolute top-20 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '0.5s' }}>✨</div>
            <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🍡</div>
            <div className="absolute bottom-10 right-10 text-6xl animate-float opacity-50" style={{ animationDelay: '1.5s' }}>🥟</div>

            {/* Main container */}
            <div className="card-warm p-8 md:p-12 max-w-lg w-full text-center relative z-10">
                {/* Logo */}
                <div className="mb-8">
                    <h1 className="text-5xl md:text-6xl font-display font-bold text-pangdip-brown mb-2 animate-wiggle">
                        🥟 PANGDIP 🥟
                    </h1>
                    <p className="text-pangdip-brown/70 font-body text-lg">
                        Kasetsart Fair 2026
                    </p>
                </div>

                {spinMutation.isPending ? (
                    <div className="py-12">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {/* IG Input */}
                        <div className="mb-8">
                            <label className="block text-pangdip-brown font-body text-left mb-2 ml-4">
                                📱 Instagram Account
                            </label>
                            <input
                                type="text"
                                value={igAccount}
                                onChange={(e) => setIgAccount(e.target.value)}
                                placeholder="yourname"
                                className="input-warm"
                                onKeyDown={(e) => e.key === 'Enter' && handleSpin()}
                            />
                        </div>

                        {/* Spin Button */}
                        <div className="flex justify-center">
                            <SpinButton
                                onClick={handleSpin}
                                isLoading={spinMutation.isPending}
                                disabled={!igAccount.trim()}
                            />
                        </div>

                        {/* Terms */}
                        <p className="mt-6 text-sm text-pangdip-brown/50 font-body">
                            กดหมุนเพื่อลุ้นรางวัลสุดพิเศษ! 🎉
                        </p>
                    </>
                )}
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
