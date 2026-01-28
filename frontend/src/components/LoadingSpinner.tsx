export const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            {/* Animated bun */}
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full bg-pangdip-custard animate-pulse" />
                <div
                    className="absolute inset-2 rounded-full bg-pangdip-orange animate-spin-slow"
                    style={{ animationDuration: '2s' }}
                />
                <div className="absolute inset-4 rounded-full bg-pangdip-custard flex items-center justify-center">
                    <span className="text-3xl animate-wiggle">🥟</span>
                </div>
            </div>

            {/* Loading dots */}
            <div className="loading-dots">
                <span />
                <span />
                <span />
            </div>

            <p className="text-pangdip-brown font-body text-lg animate-pulse">
                กำลังหมุน...
            </p>
        </div>
    );
};
