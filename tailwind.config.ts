
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Retro game colors
				retro: {
					'dark-purple': '#332F5C',
					'darker-purple': '#22203C',
					'pixel-green': '#4ADE80',
					'pixel-red': '#FB7185',
					'pixel-blue': '#4EA8DE',
					'pixel-yellow': '#FACC15',
					'pixel-brown': '#A16207',
					'pixel-gray': '#6B7280',
					'pixel-dark': '#1D1D27',
					'pixel-light': '#F1F0FB',
					// Neon 90s arcade colors
					'neon-pink': '#FF00FF',
					'neon-blue': '#00FFFF',
					'neon-green': '#00FF00',
					'neon-yellow': '#FFFF00',
					'neon-orange': '#FF6600',
					'neon-purple': '#9900FF',
					'arcade-black': '#000000',
					'arcade-blue': '#0000AA',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pixel-float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pixel-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'pixel-shine': {
					'0%': { backgroundPosition: '200% center' },
					'100%': { backgroundPosition: '-200% center' }
				},
				'neon-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 15px #ff00ff, 0 0 20px #ff00ff',
					},
					'50%': { 
						boxShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff',
					}
				},
				'pacman-move': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(calc(100% - 20px))' }
				},
				'player-jump': {
					'0%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-60px)' },
					'100%': { transform: 'translateY(0)' }
				},
				'player-run': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(20px)' }
				},
				'enemy-move': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-100%)' }
				},
				'bounce-small': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-3px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pixel-float': 'pixel-float 3s ease-in-out infinite',
				'pixel-pulse': 'pixel-pulse 2s ease-in-out infinite',
				'pixel-shine': 'pixel-shine 3s linear infinite',
				'neon-glow': 'neon-glow 2s ease-in-out infinite',
				'pacman-move': 'pacman-move 5s linear infinite alternate',
				'player-jump': 'player-jump 0.6s ease-out',
				'player-run': 'player-run 0.3s ease-in-out infinite alternate',
				'enemy-move': 'enemy-move 3s linear infinite',
				'bounce-small': 'bounce-small 0.5s ease-in-out infinite',
			},
			fontFamily: {
				'pixel': ['"Press Start 2P"', 'cursive']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
