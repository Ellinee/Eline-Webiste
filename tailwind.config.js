const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eldora: {
          text: "#17202A",
          muted: "#5F6B7A",
          line: "#E7E1DA",
          base: "#FDF8F5",
          bg: "#FAF7F2",
          warm: "#F6F1EC",
          coral: "#D95545",
          soft: "#FFE7E2",
          peach: "#FFD4C2",
          mint: "#A8D8C2",
        },
      },
      boxShadow: {
        eldora: "0 24px 80px rgba(23, 32, 42, 0.14)",
        coral: "0 18px 38px rgba(217, 85, 69, 0.28)",
      },
    },
  },
  plugins: [],
};

module.exports = config;
