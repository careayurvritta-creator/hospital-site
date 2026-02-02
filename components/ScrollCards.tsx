/**
 * Horizontal Scroll Cards Component
 * Mobile-optimized horizontal scrolling card container with snap
 */

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollCardsProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    showArrows?: boolean;
    className?: string;
}

const ScrollCards: React.FC<ScrollCardsProps> = ({
    children,
    title,
    subtitle,
    showArrows = true,
    className = '',
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const cardWidth = container.firstElementChild?.clientWidth || 280;
        const scrollAmount = cardWidth + 16; // card width + gap

        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    return (
        <div className={className}>
            {/* Header with title and arrows */}
            {(title || showArrows) && (
                <div className="flex items-center justify-between mb-4 px-4 md:px-0">
                    <div>
                        {title && (
                            <h3 className="font-serif text-xl md:text-2xl font-bold text-ayur-green">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="text-sm text-ayur-gray/70 mt-1">{subtitle}</p>
                        )}
                    </div>

                    {/* Desktop scroll arrows */}
                    {showArrows && (
                        <div className="hidden md:flex gap-2">
                            <button
                                onClick={() => scroll('left')}
                                className="w-10 h-10 rounded-full border border-ayur-subtle flex items-center justify-center text-ayur-green hover:bg-ayur-green hover:text-white hover:border-ayur-green transition-all"
                                aria-label="Scroll left"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                className="w-10 h-10 rounded-full border border-ayur-subtle flex items-center justify-center text-ayur-green hover:bg-ayur-green hover:text-white hover:border-ayur-green transition-all"
                                aria-label="Scroll right"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Scrollable container */}
            <div
                ref={scrollRef}
                className="scroll-snap-x"
                role="region"
                aria-label={title || 'Scrollable cards'}
            >
                {children}
            </div>

            {/* Mobile scroll indicator dots (optional) */}
            <div className="flex justify-center gap-1.5 mt-4 md:hidden">
                <span className="w-6 h-1 rounded-full bg-ayur-green" />
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="w-1 h-1 rounded-full bg-gray-300" />
            </div>
        </div>
    );
};

/**
 * Individual scroll card wrapper
 */
interface ScrollCardProps {
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'full';
    className?: string;
    onClick?: () => void;
}

export const ScrollCard: React.FC<ScrollCardProps> = ({
    children,
    width = 'md',
    className = '',
    onClick,
}) => {
    const widthClasses = {
        sm: 'w-[200px]',
        md: 'w-[280px]',
        lg: 'w-[320px]',
        full: 'w-[calc(100vw-3rem)]',
    };

    return (
        <div
            className={`
        ${widthClasses[width]}
        flex-shrink-0
        card-mobile
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </div>
    );
};

export default ScrollCards;
