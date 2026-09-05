/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        steel: {
          bg: '#D2D7D9',        // Steel Grey Background
          dark: '#C4CBCE',      // Secondary Background
          border: '#B4BEC2',    // Medium Steel Border
        },
        card: {
          soft: '#EEF1F2',      // Soft Grey White Cards / Panels
          hover: '#D8E8E8',     // Light Teal Grey Card Hover
        },
        industrial: {
          dark: '#263238',      // Dark Graphite Primary Text
          steel: '#56656B',     // Steel Grey Secondary Text
          teal: '#287F7A',      // Industrial Teal Primary Accent
          highlight: '#3F9692', // Teal Highlight
          darkteal: '#155E63',  // Dark Teal
          iron: '#795548',      // Iron Brown Accent
          rust: '#9A5B3D',      // Rust / Copper Accent
          copper: '#9A5B3D',
        },
        status: {
          healthy: '#5F9F4A',   // Normal / Healthy
          warning: '#D68A24',   // Warning
          critical: '#C6534F',  // Critical
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
