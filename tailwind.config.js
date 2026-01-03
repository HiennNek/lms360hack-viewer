/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
    ],
    theme: {
        extend: {
            colors: {
                pastel: {
                    pink: '#ffd1dc',
                    blue: '#c1e1c1',
                    purple: '#b19cd9',
                    yellow: '#fdfd96',
                    orange: '#ffb347',
                }
            }
        },
    },
    plugins: [],
}
