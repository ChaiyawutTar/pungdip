import { useState, useRef, useEffect } from 'react';

interface Prize {
    id: string;
    label: string;
    color: string;
    percentage: number; // UI percentage (visual size)
}

interface SpinWheelProps {
    onSpin: () => void;
    isSpinning: boolean;
    result: string | null;
    disabled?: boolean;
}

const PRIZES: Prize[] = [
    { id: 'NOTHING', label: 'เสียใจด้วย', color: '#95A5A6', percentage: 30 },
    { id: 'IG_GIVEAWAY', label: 'แจก IG', color: '#E91E63', percentage: 30 },
    { id: 'DISCOUNT_05', label: 'ลด 5%', color: '#4ECDC4', percentage: 20 },
    { id: 'DISCOUNT_10', label: 'ลด 10%', color: '#FF6B6B', percentage: 10 },
    { id: 'FREE_MEAL', label: 'กินฟรี', color: '#FF9800', percentage: 5 },
    { id: 'MK_DUCK', label: 'บัตร MK', color: '#FFD700', percentage: 3 },
    { id: 'STARBUCKS', label: 'Starbucks 1000฿', color: '#00704A', percentage: 2 },
];

// Calculate cumulative angles for each section
const calculateAngles = (prizes: Prize[]) => {
    let cumulative = 0;
    return prizes.map((prize) => {
        const startAngle = cumulative;
        const angle = (prize.percentage / 100) * 360;
        cumulative += angle;
        return {
            ...prize,
            startAngle,
            endAngle: cumulative,
            angle,
        };
    });
};

const PRIZES_WITH_ANGLES = calculateAngles(PRIZES);

// Convert degrees to radians
const degToRad = (deg: number) => (deg * Math.PI) / 180;

// Generate SVG path for a pie slice
const generateSlicePath = (
    cx: number,
    cy: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    innerRadius: number = 0
) => {
    // Offset by -90 degrees so 0 starts at top
    const adjustedStart = startAngle - 90;
    const adjustedEnd = endAngle - 90;

    const x1 = cx + radius * Math.cos(degToRad(adjustedStart));
    const y1 = cy + radius * Math.sin(degToRad(adjustedStart));
    const x2 = cx + radius * Math.cos(degToRad(adjustedEnd));
    const y2 = cy + radius * Math.sin(degToRad(adjustedEnd));

    const x1Inner = cx + innerRadius * Math.cos(degToRad(adjustedStart));
    const y1Inner = cy + innerRadius * Math.sin(degToRad(adjustedStart));
    const x2Inner = cx + innerRadius * Math.cos(degToRad(adjustedEnd));
    const y2Inner = cy + innerRadius * Math.sin(degToRad(adjustedEnd));

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    if (innerRadius > 0) {
        return `
            M ${x1Inner} ${y1Inner}
            L ${x1} ${y1}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
            L ${x2Inner} ${y2Inner}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
            Z
        `;
    }

    return `
        M ${cx} ${cy}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
    `;
};

export const SpinWheel = ({ onSpin, isSpinning, result, disabled }: SpinWheelProps) => {
    const [rotation, setRotation] = useState(0);
    const [hasSpun, setHasSpun] = useState(false);
    const wheelRef = useRef<SVGGElement>(null);
    const spinningRef = useRef(false);

    const cx = 160;
    const cy = 160;
    const radius = 140;
    const innerRadius = 35;

    // Find the target angle for a result
    const getResultRotation = (resultId: string) => {
        const prize = PRIZES_WITH_ANGLES.find(
            (p) => p.id === resultId || p.id.startsWith(resultId.split('_')[0])
        );
        if (!prize) return 360 * 5;

        // Target the middle of the prize section
        const targetAngle = (prize.startAngle + prize.endAngle) / 2;
        // Spin multiple times + land with pointer at right (90 degrees from top)
        return 360 * 5 + (90 - targetAngle);
    };

    useEffect(() => {
        if (isSpinning && result && !spinningRef.current) {
            spinningRef.current = true;
            const targetRotation = rotation + getResultRotation(result);
            setRotation(targetRotation);
            setHasSpun(true);

            setTimeout(() => {
                spinningRef.current = false;
            }, 4000);
        }
    }, [isSpinning, result]);

    const handleCenterClick = () => {
        if (!isSpinning && !disabled) {
            onSpin();
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Wheel container */}
            <div className="relative w-72 h-72 md:w-80 md:h-80">
                {/* Pointer/Arrow on the right side - pointing left towards wheel */}
                <div
                    className="absolute z-20"
                    style={{
                        top: '50%',
                        right: '-12px',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <svg width="50" height="40" viewBox="0 0 50 40">
                        {/* Horizontal teardrop pointing left */}
                        <path
                            d="M50 20 C50 10 40 0 30 0 L10 20 L30 40 C40 40 50 30 50 20 Z"
                            fill="#E74C3C"
                            filter="drop-shadow(-2px 2px 3px rgba(0,0,0,0.3))"
                        />
                    </svg>
                </div>

                {/* SVG Wheel */}
                <svg
                    viewBox="0 0 320 320"
                    className="w-full h-full drop-shadow-2xl"
                >
                    {/* Outer border */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={radius + 8}
                        fill="none"
                        stroke="#3D2914"
                        strokeWidth="8"
                    />

                    {/* Rotating wheel group */}
                    <g
                        ref={wheelRef}
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: `${cx}px ${cy}px`,
                            transition: hasSpun
                                ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
                                : 'none',
                        }}
                    >
                        {/* Prize slices - no text inside */}
                        {PRIZES_WITH_ANGLES.map((prize) => {
                            const path = generateSlicePath(
                                cx,
                                cy,
                                radius,
                                prize.startAngle,
                                prize.endAngle,
                                innerRadius
                            );

                            return (
                                <path
                                    key={prize.id}
                                    d={path}
                                    fill={prize.color}
                                    stroke="#fff"
                                    strokeWidth="2"
                                />
                            );
                        })}
                    </g>

                    {/* Center clickable button */}
                    <g
                        onClick={handleCenterClick}
                        style={{ cursor: isSpinning || disabled ? 'not-allowed' : 'pointer' }}
                        className="spin-button-center"
                    >
                        <circle
                            cx={cx}
                            cy={cy}
                            r={innerRadius}
                            fill="url(#centerGradient)"
                            stroke="#3D2914"
                            strokeWidth="4"
                            className={`${isSpinning || disabled ? 'opacity-50' : 'hover:brightness-110'} transition-all`}
                        />
                        <text
                            x={cx}
                            y={cy}
                            fill="#3D2914"
                            fontSize="16"
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ pointerEvents: 'none' }}
                        >
                            {isSpinning ? '...' : 'หมุน!'}
                        </text>
                    </g>

                    {/* Gradients */}
                    <defs>
                        <radialGradient id="centerGradient" cx="50%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#FFF9E6" />
                            <stop offset="100%" stopColor="#F5DEB3" />
                        </radialGradient>
                    </defs>
                </svg>
            </div>

            {/* Legend - color-coded labels */}
            <div className="flex flex-col gap-2 bg-[#FFF5E6] p-4 rounded-xl">
                <h3 className="font-bold text-pangdip-brown mb-2 text-center">รางวัล</h3>
                {PRIZES.map((prize) => (
                    <div key={prize.id} className="flex items-center gap-2">
                        <div
                            className="w-4 h-4 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: prize.color }}
                        />
                        <span className="text-sm text-pangdip-brown font-medium">
                            {prize.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
