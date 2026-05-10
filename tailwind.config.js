/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.tsx",
        "./pages/**/*.tsx",
        "./components/**/*.tsx",
    ],
    theme: {
        screens: {
            'xs': '375px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                ayur: {
                    green: {
                        DEFAULT: '#0d8770',
                        text: '#1a1a2e',
                        dark: '#094c47',
                        light: '#e6f4f1',
                    },
                    accent: {
                        DEFAULT: '#c9a227',
                        hover: '#b8931f',
                        light: '#fef9e6',
                    },
                    cream: '#fefefe',
                    bg: '#fefefe',
                    surface: '#f8f9fa',
                    gray: '#6b7280',
                    muted: '#6b7280',
                    light: '#FFFFFF',
                    subtle: '#e5e7eb',
                    border: '#e5e7eb',
                    text: '#1a1a2e',
                }
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['Philosopher', 'sans-serif'],
            },
            backgroundImage: {
                'mandala': "url('https://www.transparenttextures.com/patterns/black-scales.png')",
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            spacing: {
                'safe-top': 'env(safe-area-inset-top)',
                'safe-bottom': 'env(safe-area-inset-bottom)',
                'safe-left': 'env(safe-area-inset-left)',
                'safe-right': 'env(safe-area-inset-right)',
                '18': '4.5rem',
                '22': '5.5rem',
            },
            minHeight: {
                'touch': '48px',
                'touch-lg': '56px',
                'screen-safe': 'calc(100vh - env(safe-area-inset-bottom))',
            },
            minWidth: {
                'touch': '48px',
            },
            height: {
                'bottom-nav': '64px',
                'header': '56px',
                'header-md': '72px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
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
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-8px)' },
                },
                gradientShift: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                drawCheck: {
                    '0%': { strokeDashoffset: '24' },
                    '100%': { strokeDashoffset: '0' },
                },
            },
            animation: {
                'fadeIn': 'fadeIn 0.6s ease-out forwards',
                'fadeInUp': 'fadeInUp 0.6s ease-out forwards',
                'slideUp': 'slideUp 0.3s ease-out forwards',
                'slideDown': 'slideDown 0.3s ease-out forwards',
                'slideInRight': 'slideInRight 0.3s ease-out forwards',
                'slideInLeft': 'slideInLeft 0.3s ease-out forwards',
                'bounce-gentle': 'bounce 2s ease-in-out infinite',
                'pulse-slow': 'pulse 2s ease-in-out infinite',
                'spin-slow': 'spin 12s linear infinite',
                'float': 'float 3s ease-in-out infinite',
                'gradientShift': 'gradientShift 8s ease infinite',
                'scaleIn': 'scaleIn 0.4s ease-out forwards',
                'drawCheck': 'drawCheck 0.4s ease-out forwards',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'card': '0 4px 20px -5px rgba(13, 135, 112, 0.1)',
                'card-hover': '0 20px 40px -10px rgba(13, 135, 112, 0.15)',
                'glow': '0 0 20px rgba(13, 135, 112, 0.3)',
                'cta': '0 4px 16px rgba(201, 162, 39, 0.3)',
            }
        }
    },
    plugins: [],
}