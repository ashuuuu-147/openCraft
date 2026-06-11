/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#f54e00',          // Cursor Orange
        'primary-active': '#d04200',   // Cursor Orange Active
        'ink': '#26251e',              // Near-black warm ink
        'body': '#5a5852',             // Running body text
        'body-strong': '#26251e',
        'muted': '#807d72',            // Muted sub-text
        'muted-soft': '#a09c92',
        'hairline': '#e6e5e0',         // Dividers
        'hairline-soft': '#efeee8',
        'hairline-strong': '#cfcdc4',
        'canvas': '#f7f7f4',           // Warm cream floor
        'canvas-soft': '#fafaf7',      // IDE mockup pane
        'surface-card': '#ffffff',     // Card surface
        'surface-strong': '#e6e5e0',
        'on-primary': '#ffffff',
        // AI stages
        'timeline-thinking': '#dfa88f', // Peach
        'timeline-grep': '#9fc9a2',     // Mint
        'timeline-read': '#9fbbe0',     // Blue
        'timeline-edit': '#c0a8dd',     // Lavender
        'timeline-done': '#c08532',     // Gold
        // Semantics
        'semantic-success': '#1f8a65',
        'semantic-error': '#cf2d56',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'none': '0px',
        'xs': '4px',
        'sm': '6px',
        'md': '8px',       // CTA buttons, inputs
        'lg': '12px',      // Cards, mockups
        'xl': '16px',
        'pill': '9999px',
        'full': '9999px',
      },
      spacing: {
        'xxs': '4px',
        'xs': '8px',
        'sm': '12px',
        'base': '16px',
        'md': '20px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'section': '80px',
      },
      letterSpacing: {
        'mega': '-2.16px',
        'lg': '-0.72px',
        'md': '-0.325px',
        'sm': '-0.11px',
      },
      boxShadow: {
        'none': 'none',
      }
    },
  },
  plugins: [],
}
