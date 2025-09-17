
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
			fontFamily: {
				'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'playfair': ['Playfair Display', 'Georgia', 'serif'],
				'crimson': ['Crimson Text', 'Georgia', 'serif'],
			},
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
				// Novas cores extraídas das imagens
				'brand-blue': {
					50: 'hsl(216 100 95)',
					100: 'hsl(216 100 90)',
					500: '#113d63', // Azul do cabeçalho da aplicação
					600: '#0f3456',
					700: '#0d2b49',
					800: '#0a223c',
					900: '#08192f'
				},
				'brand-coral': {
					50: 'hsl(330 100 95)',
					100: 'hsl(330 100 90)',
					500: '#f04393', // Rosa vibrante do gradiente
					600: '#e03d85',
					700: '#d03777',
					800: '#c03169',
					900: '#b02b5b'
				},
				'brand-yellow': {
					50: 'hsl(45 100 95)',
					100: 'hsl(45 100 90)',
					500: '#f9c449', // Amarelo do gradiente
					600: '#f7b73b',
					700: '#f5aa2d',
					800: '#f39d1f',
					900: '#f19011'
				},
				// Azuis complementares para landing page
				'sky-blue': {
					50: 'hsl(208 100 97)',
					100: 'hsl(208 100 93)',
					500: 'hsl(208 89 75)', // Azul Céu Claro
					600: 'hsl(208 89 67)',
					700: 'hsl(208 89 59)'
				},
				'pastel-blue': {
					50: 'hsl(196 21 97)',
					100: 'hsl(196 21 93)',
					500: 'hsl(196 21 75)', // Azul Pastel
					600: 'hsl(196 21 67)',
					700: 'hsl(196 21 59)'
				},
				'ice-blue': {
					50: 'hsl(216 100 98)',
					100: 'hsl(216 100 96)',
					500: 'hsl(216 100 90)', // Azul Gelo
					600: 'hsl(216 100 82)',
					700: 'hsl(216 100 74)'
				},
				'erp-blue': {
					50: 'hsl(214 100 97)',
					100: 'hsl(214 95 93)',
					500: 'hsl(217 91 60)',
					600: 'hsl(221 83 53)',
					700: 'hsl(224 76 48)',
					900: 'hsl(226 71 40)'
				},
				'erp-success': {
					50: 'hsl(138 76 97)',
					500: 'hsl(142 71 45)',
					600: 'hsl(142 76 36)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
