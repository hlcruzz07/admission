<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class MailAccountRotator
{
    protected int $dailyCap;

    /** @var string[] */
    protected array $mailers = [];

    public function __construct()
    {
        $this->dailyCap = (int) env('MAIL_ROTATION_DAILY_CAP', 1800);

        $count = (int) env('MAIL_ROTATION_ACCOUNT_COUNT', 0);

        for ($i = 1; $i <= $count; $i++) {
            if (env("GMAIL_ACCOUNT_{$i}_ADDRESS")) {
                $this->mailers[] = "gmail_{$i}";
            }
        }
    }

    /**
     * Returns the next mailer that still has quota today AND isn't
     * currently blocked (e.g. from a recent send failure), excluding
     * any mailer names passed in $exclude (already tried this run).
     *
     * @param string[] $exclude
     */
    public function pickMailer(array $exclude = []): ?string
    {
        $today = now()->format('Y-m-d');

        foreach ($this->mailers as $mailerName) {
            if (in_array($mailerName, $exclude, true)) {
                continue;
            }

            if ($this->isBlocked($mailerName)) {
                continue;
            }

            $sentToday = (int) Cache::get($this->cacheKey($mailerName, $today), 0);

            if ($sentToday < $this->dailyCap) {
                return $mailerName;
            }
        }

        return null;
    }

    public function recordSent(string $mailerName): void
    {
        $today = now()->format('Y-m-d');
        $key = $this->cacheKey($mailerName, $today);

        Cache::add($key, 0, now()->endOfDay());
        Cache::increment($key);
    }

    /**
     * Marks an account as temporarily unusable (e.g. Gmail API returned
     * a quota/rate-limit/auth error). Default cooldown is 1 hour — long
     * enough to ride out a transient throttle, short enough that a
     * legitimately-fine account isn't sidelined all day over a blip.
     *
     * For clearly permanent failures (suspended, revoked auth), pass a
     * long TTL so it's effectively parked until someone checks the account.
     */
    public function markBlocked(string $mailerName, int $ttlSeconds = 3600): void
    {
        Cache::put($this->blockKey($mailerName), true, $ttlSeconds);
    }

    public function isBlocked(string $mailerName): bool
    {
        return (bool) Cache::get($this->blockKey($mailerName), false);
    }

    /**
     * Classifies whether an exception looks like a permanent account
     * problem (suspended, invalid grant, forbidden) vs a transient one
     * (rate limit, temporary quota, timeout). Adjust patterns as you
     * observe real error messages from the Gmail API.
     */
    public function classifyFailure(\Throwable $e): string
    {
        $message = strtolower($e->getMessage());

        $permanentPatterns = [
            'invalid_grant',
            'account has been suspended',
            'account not found',
            'unauthorized_client',
            'insufficient permission',
            'daily user sending limit exceeded', // treat as "done for today", not transient
        ];

        foreach ($permanentPatterns as $pattern) {
            if (str_contains($message, $pattern)) {
                return 'permanent';
            }
        }

        return 'transient';
    }

    /** @return string[] */
    public function allMailers(): array
    {
        return $this->mailers;
    }

    protected function cacheKey(string $mailerName, string $date): string
    {
        return "mail_rotation:{$mailerName}:{$date}";
    }

    protected function blockKey(string $mailerName): string
    {
        return "mail_rotation_blocked:{$mailerName}";
    }
}