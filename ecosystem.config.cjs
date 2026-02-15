module.exports = {
    apps: [
        {
            name: 'fashion-be',
            script: 'node dist/app.js',
            instances: 'max',
            exec_mode: 'cluster',
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            }
        }
    ]
};
