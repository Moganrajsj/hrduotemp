// Assembles a deployable copy of the Laravel application into ./dist
//
// Hostinger's "Web App" / static deployment flow runs `npm run build` and then
// publishes the contents of the configured output directory (default: `dist`).
// Laravel is a PHP app, so the published folder must contain the whole
// application (app/, bootstrap/, config/, public/, vendor/, artisan, ...),
// not just the Vite assets.
//
// This script copies the application into dist/ so that flow can publish a
// working Laravel site. It is only used by the Node build pipeline; the
// generic PHP "Advanced -> Git" deployment ignores it entirely.

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');

// Never copy these into the published folder.
const EXCLUDE_NAMES = new Set([
    'node_modules',
    'dist',
    '.git',
    '.github',
    '.vercel',
    '.vscode',
    '.idea',
    'tests',
    'job-website-template-131',
    'api',
    // local secret files (must be created manually on the server)
    '.env',
    '.env.production',
    '.env.local',
    '.env.backup',
    '.env.dev',
]);

function shouldCopy(name) {
    return !EXCLUDE_NAMES.has(name);
}

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (!shouldCopy(entry.name)) {
            continue;
        }

        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(from, to);
        } else if (entry.isSymbolicLink()) {
            fs.symlinkSync(fs.readlinkSync(from), to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}

fs.rmSync(out, { recursive: true, force: true });
copyDir(root, out);

// Laravel needs these directories to exist and be writable at runtime.
for (const dir of [
    'storage/app/public',
    'storage/framework/cache/data',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'bootstrap/cache',
]) {
    fs.mkdirSync(path.join(out, dir), { recursive: true });
}

// If the deployment platform provides Laravel environment variables at build
// time (Hostinger: Deployments -> Deployment settings -> Environment
// variables), materialise them into dist/.env so the PHP app can boot without
// manual file uploads. Secrets are never committed to the repository.
const ENV_KEYS = [
    'APP_NAME', 'APP_ENV', 'APP_KEY', 'APP_DEBUG', 'APP_URL', 'ASSET_URL',
    'LOG_CHANNEL', 'LOG_DEPRECATIONS_CHANNEL', 'LOG_LEVEL',
    'DB_CONNECTION', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'DB_SOCKET',
    'BROADCAST_DRIVER', 'CACHE_DRIVER', 'FILESYSTEM_DISK', 'QUEUE_CONNECTION',
    'SESSION_DRIVER', 'SESSION_LIFETIME', 'SESSION_DOMAIN', 'SESSION_SECURE_COOKIE',
    'MEMCACHED_HOST', 'REDIS_CLIENT', 'REDIS_HOST', 'REDIS_PASSWORD', 'REDIS_PORT', 'REDIS_DB', 'REDIS_CACHE_DB',
    'MAIL_MAILER', 'MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_ENCRYPTION',
    'MAIL_FROM_ADDRESS', 'MAIL_FROM_NAME',
    'MAILGUN_DOMAIN', 'MAILGUN_SECRET', 'MAILGUN_ENDPOINT', 'POSTMARK_TOKEN',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_DEFAULT_REGION', 'AWS_BUCKET',
    'AWS_URL', 'AWS_ENDPOINT', 'AWS_USE_PATH_STYLE_ENDPOINT',
    'PUSHER_APP_ID', 'PUSHER_APP_KEY', 'PUSHER_APP_SECRET', 'PUSHER_HOST',
    'PUSHER_PORT', 'PUSHER_SCHEME', 'PUSHER_APP_CLUSTER',
    'SANCTUM_STATEFUL_DOMAINS', 'BCRYPT_ROUNDS', 'MAIN_ADMIN_EMAIL',
];

function formatEnvValue(value) {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const text = String(value);

    if (/[\s#"']/.test(text)) {
        return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }

    return text;
}

if (process.env.APP_KEY) {
    const lines = ENV_KEYS.map((key) => `${key}=${formatEnvValue(process.env[key])}`);
    fs.writeFileSync(path.join(out, '.env'), lines.join('\n') + '\n');
    console.log('dist/.env generated from deployment environment variables');
} else {
    console.log('dist/.env not generated: set the environment variables in the deployment settings');
}

const required = ['artisan', 'vendor/autoload.php', 'public/index.php', '.htaccess'];
for (const file of required) {
    if (!fs.existsSync(path.join(out, file))) {
        console.error(`ERROR: dist is missing required file: ${file}`);
        process.exit(1);
    }
}

console.log('dist prepared: Laravel application copied to ./dist');
