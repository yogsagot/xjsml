module.exports = {
  apps : [{
    name: 'xjsml test app',
    script: './app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: '--watch',
    instances: 1,
    autorestart: true,
    watch: true,
    ignore_watch: ["node_modules"],
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
    }
  }]
};
