<?php

/**
 * Vercel serverless entry point for the Laravel application.
 *
 * Vercel's filesystem is read-only except for /tmp, so Laravel's writable
 * paths (compiled views) are redirected there via environment variables
 * (see vercel.json) and the bundled SQLite database is copied there on the
 * first request of a cold start.
 */

foreach (['/tmp/views', '/tmp/cache', '/tmp/sessions', '/tmp/storage'] as $directory) {
    if (! is_dir($directory)) {
        @mkdir($directory, 0777, true);
    }
}

$bundledDatabase = __DIR__.'/../database/database.sqlite';
$runtimeDatabase = '/tmp/database.sqlite';

if (is_file($bundledDatabase) && ! is_file($runtimeDatabase)) {
    // Copy to a per-process temp file and rename it into place so concurrent
    // cold-start requests never read a partially copied database.
    $temporaryDatabase = '/tmp/database.sqlite.'.getmypid().'.tmp';

    if (@copy($bundledDatabase, $temporaryDatabase)) {
        @rename($temporaryDatabase, $runtimeDatabase);
    }

    @unlink($temporaryDatabase);
}

require __DIR__.'/../public/index.php';
