# Deployment — HR DUO Careers (Laravel 9)

Repository: `https://github.com/Moganrajsj/hrduotemp` (branch `main`)

The repository is public, so **secrets are never committed**. The real `.env` is created on the server.

---

## Option A — PHP/HTML website + Advanced → Git (recommended)

Use this for the real domain, `https://hrduocareers.com`.

1. hPanel → **Websites** → **hrduocareers.com** → **Manage**
2. **Advanced** → **Git** → **Connect with GitHub**
3. Select `Moganrajsj/hrduotemp`
4. Settings:
   - **Branch:** `main`
   - **Deploy directory:** `public_html`
5. Click **Deploy**

No build step runs. `vendor/` and `public/build/` are already committed, so nothing else is required on the server.

### Create `.env` (one time)

1. hPanel → **File Manager** → `public_html`
2. Copy `.env.production.example` → rename the copy to `.env`
3. Edit `.env` and fill in the real values.

The required keys are (values are kept out of this public file — use the values from your local `.env.production`):

```dotenv
APP_NAME="HR DUO Careers"
APP_ENV=production
APP_KEY=            # base64:... (production key)
APP_DEBUG=false
APP_URL=https://hrduocareers.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=            # database host
DB_PORT=3306
DB_DATABASE=        # database name
DB_USERNAME=        # database user
DB_PASSWORD=        # database password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=        # Gmail address
MAIL_PASSWORD=        # Google App Password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=    # Gmail address
MAIL_FROM_NAME="HR DUO Careers"

SANCTUM_STATEFUL_DOMAINS=hrduocareers.com,www.hrduocareers.com
BCRYPT_ROUNDS=12

MAIN_ADMIN_EMAIL=     # main admin email
```

### PHP version

hPanel → **Advanced** → **PHP Configuration** → **PHP 8.2** (Laravel 9 supports 8.0–8.2).

### Verify

Open `https://hrduocareers.com` — the home page should load, `/login` should show the admin login, and the contact form should send mail.

---

## Option B — Web App deployment (static publisher)

Use this only if you are deploying to a temporary Hostinger subdomain through
**Deployments**.

The build script assembles the full Laravel application into `dist/`:

```bash
npm install
npm run build   # vite build + node scripts/build-dist.mjs
```

Then Hostinger publishes `dist/` to `public_html`.

### Environment variables

Deployments → **Deployment settings** → **Environment variables** → add the same keys
listed in Option A. The build script writes them to `dist/.env` automatically.

If the variables are not set, the build still succeeds but you must create `.env`
manually in File Manager afterwards.

---

## Notes

- **Never commit `.env`.** Only `.env.example` and `.env.production.example` belong in the repo.
- A Git deploy replaces files in the deploy directory. Keep a backup of `.env` and
  re-create it if it disappears after a push.
- The application root `.htaccess` routes every request into `public/`, so deploying the
  repository into `public_html` works without moving folders around.
- Required writable directories: `storage/` and `bootstrap/cache/` (775).
