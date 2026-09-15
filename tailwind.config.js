const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eline: {
          base: "#F5FFFE",
          mint: "#D1F4F2",
          accent: "#74D3CE",
          teal: "#2A9D8F",
          text: "#264653",
          deep: "#004B48",
          muted: "#526F76",
          line: "#D5E8E5",
        },
      },
      fontFamily: { sans: ["var(--font-nunito)", "sans-serif"] },
    },
  },
  plugins: [],
};

module.exports = config;
