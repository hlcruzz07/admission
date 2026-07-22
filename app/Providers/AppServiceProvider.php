<?php

namespace App\Providers;

use App\Mail\Transport\GmailApiTransport;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerGmailApiTransport();
        $this->registerRotatingMailAccounts();

        RateLimiter::for('mail-send', function () {
            return Limit::perMinute(30);
        });
    }

    /**
     * Registers the custom 'gmail_api' transport driver so mailers
     * configured with transport => 'gmail_api' resolve correctly.
     */
    protected function registerGmailApiTransport(): void
    {
        Mail::extend('gmail_api', function (array $config) {
            return new GmailApiTransport($config['account_index']);
        });
    }

    /**
     * Registers gmail_1, gmail_2, ... mailers using Gmail API + OAuth2,
     * one per GMAIL_ACCOUNT_{n}_* set in .env.
     */
    protected function registerRotatingMailAccounts(): void
    {
        $count = (int) env('MAIL_ROTATION_ACCOUNT_COUNT', 0);

        for ($i = 1; $i <= $count; $i++) {
            $address = env("GMAIL_ACCOUNT_{$i}_ADDRESS");
            $clientId = env("GMAIL_ACCOUNT_{$i}_CLIENT_ID");
            $clientSecret = env("GMAIL_ACCOUNT_{$i}_CLIENT_SECRET");
            $refreshToken = env("GMAIL_ACCOUNT_{$i}_REFRESH_TOKEN");

            if (!$address || !$clientId || !$clientSecret || !$refreshToken) {
                continue;
            }

            Config::set("mail.mailers.gmail_{$i}", [
                'transport' => 'gmail_api',
                'account_index' => $i,
            ]);
        }
    }
}