import type { LockSwitchProps } from '../types';

export const LockSwitch = ({ isLocked, onToggle, disabled }: LockSwitchProps) => {
    return (
        <div className="flex items-center gap-4">
            <button
                type="button"
                role="switch"
                aria-checked={isLocked}
                disabled={disabled}
                onClick={() => onToggle(!isLocked)}
                className={`
          relative inline-flex h-14 w-28 items-center rounded-full
          transition-all duration-300 ease-in-out
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isLocked
                        ? 'bg-pangdip-orange shadow-lg shadow-pangdip-orange/30'
                        : 'bg-gray-300'
                    }
        `}
            >
                <span
                    className={`
            inline-flex h-12 w-12 items-center justify-center
            rounded-full bg-white shadow-lg
            transform transition-all duration-300 ease-in-out
            ${isLocked ? 'translate-x-14' : 'translate-x-1'}
          `}
                >
                    {isLocked ? (
                        <span className="text-2xl">🔒</span>
                    ) : (
                        <span className="text-2xl">🔓</span>
                    )}
                </span>
            </button>

            <span className={`
        font-display font-bold text-lg
        ${isLocked ? 'text-pangdip-orange' : 'text-gray-500'}
      `}>
                {isLocked ? 'LOCKED' : 'OFF'}
            </span>
        </div>
    );
};
