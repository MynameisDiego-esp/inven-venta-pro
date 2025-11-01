module.exports = {
  apps: [
    {
      name: "backend",
      script: "./BACKEND/index.js",
      watch: true,
    },
    {
      name: "frontend",
      cwd: "./frontend",
      // usamos cmd /c para ejecutar npm correctamente en Windows
      script: "cmd",
      args: ["/c", "npm", "run", "dev"],
      env: {
        NODE_ENV: "development",
        PORT: 5173,
      },
    },
  ],
};
