// pm2 config for rate-it, sharing the same CPX22 (4GB) box as aggarha,
// fops-dashboard and vulpesarena. Kept single-instance with a hard memory cap so a
// leak here can't be the thing that triggers another kernel panic.
module.exports = {
  apps: [
    {
      name: "rate-it",
      cwd: __dirname + "/..",
      script: "npm",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
        PORT: 3200,
      },
    },
  ],
};
