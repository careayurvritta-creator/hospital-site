/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.tsx",
        "./pages/**/*.tsx",
        "./components/**/*.tsx",
    ],
    theme: {
        // Mobile-first screens (default is mobile, sm and up for larger)
        screens: {
            'xs': '375px',   // iPhone SE
            'sm': '640px',   // Small tablets
            'md': '768px',   // Tablets
            'lg': '1024px',  // Laptops
            'xl': '1280px',  // Desktops
            '2xl': '1536px', // Large screens
        },
        extend: {
            colors: {
                ayur: {
                    green: {
                        DEFAULT: '#009688', // Core Brand Teal (Logo)
                        text: '#1A3C34',    // Deep Jungle Green for text
                        dark: '#004D40',    // Deep Teal for footer/dark sections
                        light: '#E8F5F3',   // Very light teal tint
                    },
                    accent: {
                        DEFAULT: '#BFA05A', // Antique Bronze (Luxury Gold)
                        hover: '#A68B45',   // Darker Bronze on interaction
                        light: '#F5EFE0',   // Light bronze/cream tint
                    },
                    cream: '#FDFBF7',      // Ivory Pearl background
                    gray: '#1A3C34',       // Deep Jungle Green for text (harmonious)
                    light: '#FFFFFF',
                    subtle: '#E8E4D9',     // Warm border color
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['Philosopher', 'sans-serif'],
            },
            backgroundImage: {
                'mandala': "url('https://www.transparenttextures.com/patterns/black-scales.png')",
            },
            // Touch-friendly spacing
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
                '18': '4.5rem',
                '22': '5.5rem',
            },
            // Mobile-friendly sizing
            minHeight: {
                'touch': '48px',
                'touch-lg': '56px',
                'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
            },
            minWidth: {
                'touch': '48px',
            },
            // Bottom nav height
            height: {
                'bottom-nav': '64px',
                'header': '56px',
                'header-md': '72px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                bounce: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                spin: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                }
            },
            animation: {
                'fadeIn': 'fadeIn 0.6s ease-out forwards',
                'slideUp': 'slideUp 0.3s ease-out forwards',
                'slideDown': 'slideDown 0.3s ease-out forwards',
                'slideInRight': 'slideInRight 0.3s ease-out forwards',
                'slideInLeft': 'slideInLeft 0.3s ease-out forwards',
                'bounce-gentle': 'bounce 2s ease-in-out infinite',
                'pulse-slow': 'pulse 2s ease-in-out infinite',
                'spin-slow': 'spin 12s linear infinite',
            },
            // Touch-optimized border radius
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            // Box shadows for mobile
            boxShadow: {
                'bottom-nav': '0 -4px 20px rgba(0, 0, 0, 0.08)',
                'card-mobile': '0 2px 8px rgba(0, 0, 0, 0.06)',
                'card-mobile-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
                'cta': '0 4px 16px rgba(191, 160, 90, 0.4)',
            }
        }
    },
    plugins: [],
}

