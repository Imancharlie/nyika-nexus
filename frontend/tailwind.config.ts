
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
			fontFamily: {
				sans: ['Instrument Sans', 'Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
				display: ['Bricolage Grotesque', 'Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
			},
			colors: {
				forest: '#03160D',
				deep: '#06301A',
				emerald: '#0B7A43',
				leaf: '#34C16B',
				lime: '#C8F169',
				mint: '#5FD38A',
				gold: '#FFD36A',
				navy: '#0A3D73',
				chip: '#E3F5E9',
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
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' },
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				fadeInUp: {
					from: { 
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
				},
				fadeInDown: {
					from: { 
						opacity: '0',
						transform: 'translateY(-10px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
				},
				slideInRight: {
					from: { 
						opacity: '0',
						transform: 'translateX(-20px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateX(0)'
					},
				},
				slideInLeft: {
					from: { 
						opacity: '0',
						transform: 'translateX(20px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateX(0)'
					},
				},
				pulse: {
					'0%, 100%': { 
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.85',
						transform: 'scale(0.98)'
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-in-up': 'fadeInUp 0.5s ease-out',
				'fade-in-down': 'fadeInDown 0.5s ease-out',
				'slide-in-right': 'slideInRight 0.5s ease-out',
				'slide-in-left': 'slideInLeft 0.5s ease-out',
				'pulse-slow': 'pulse 3s ease-in-out infinite',
			},
			transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
			transitionTimingFunction: {
        'soft-spring': 'cubic-bezier(0.5, 0, 0, 1.25)',
      },
			transitionDuration: {
        '400': '400ms',
      },
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
