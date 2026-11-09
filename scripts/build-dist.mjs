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

const required = ['artisan', 'vendor/autoload.php', 'public/index.php', '.htaccess'];
for (const file of required) {
    if (!fs.existsSync(path.join(out, file))) {
        console.error(`ERROR: dist is missing required file: ${file}`);
        process.exit(1);
    }
}

console.log('dist prepared: Laravel application copied to ./dist');
