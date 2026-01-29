import type { SpinButtonProps } from '../types';

export const SpinButton = ({ onClick, isLoading, disabled }: SpinButtonProps) => {
    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`
        btn-spin px-16 py-5 text-2xl rounded-full
        ${isLoading ? 'cursor-wait' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <span className="tracking-widest font-bold">
                SPIN
            </span>
        </button>
    );
};
