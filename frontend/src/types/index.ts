// Prize types
export interface Prize {
    id: string;
    name: string;
    stock: number;
    probability: number;
    is_triggered: boolean;
}

// Spin types
export interface SpinRequest {
    instagram_id: string;
}

export interface SpinResult {
    result: string;
    prize_name: string;
    is_locked?: boolean;
}

// Log types
export interface SpinLog {
    id: number;
    instagram_id: string;
    prize_won: string;
    prize_name: string;
    was_locked: boolean;
    timestamp: string;
}

// Lock types
export interface LockRequest {
    prize_id: string;
    secret: string;
}

export interface LockStatus {
    is_locked: boolean;
    locked_prize_id?: string;
}

// Stock types
export interface StockStatus {
    prize_id: string;
    name: string;
    stock: number;
    max: number;
}

// API response types
export interface APIResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface AdminStatus {
    lock: LockStatus;
    stocks: StockStatus[];
}

// Component prop types
export interface SpinButtonProps {
    onClick: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export interface PrizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    prize: SpinResult | null;
}

export interface LockSwitchProps {
    isLocked: boolean;
    onToggle: (locked: boolean) => void;
    disabled?: boolean;
}

export interface LogTableProps {
    logs: SpinLog[];
    isLoading?: boolean;
}

// Prize configurations for display
export const PRIZE_DISPLAY: Record<string, { emoji: string; color: string }> = {
    MK_DUCK: { emoji: '🦆', color: 'text-yellow-500' },
    STARBUCKS: { emoji: '☕', color: 'text-green-600' },
    DISCOUNT_10: { emoji: '🎫', color: 'text-orange-500' },
    DISCOUNT_05: { emoji: '🏷️', color: 'text-blue-500' },
    GIVE_IG: { emoji: '📱', color: 'text-pink-500' },
    NOTHING: { emoji: '😢', color: 'text-gray-500' },
};
