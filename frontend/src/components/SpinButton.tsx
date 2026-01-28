import type { SpinButtonProps } from '../types';

export const SpinButton = ({ onClick, isLoading, disabled }: SpinButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`
        btn-spin px-16 py-6 text-3xl
        ${isLoading ? 'animate-pulse cursor-wait' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {isLoading ? (
                <div className="flex items-center gap-4">
                    <svg
                        className="animate-spin h-8 w-8"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    <span>กำลังหมุน...</span>
                </div>
            ) : (
                <span className="tracking-wider">🎰 SPIN!</span>
            )}
        </button>
    );
};
