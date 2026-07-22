<?php

namespace App\Console\Commands;

use Google\Client;
use Google\Service\Gmail;
use Illuminate\Console\Command;

class GmailToken extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:gmail-token';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a Gmail API Refresh Token';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $client = new Client();

        $client->setClientId(env('GMAIL_ACCOUNT_2_CLIENT_ID'));
        $client->setClientSecret(env('GMAIL_ACCOUNT_2_CLIENT_SECRET'));
        $client->setRedirectUri(env('GMAIL_REDIRECT_URI', 'http://localhost:8000/oauth/callback'));

        $client->setAccessType('offline');
        $client->setPrompt('consent');
        $client->addScope(Gmail::GMAIL_SEND);

        $authUrl = $client->createAuthUrl();

        $this->newLine();
        $this->info('===========================================');
        $this->info('Open the following URL in your browser:');
        $this->info('===========================================');
        $this->line($authUrl);
        $this->newLine();

        $code = $this->ask('After authorizing, paste the authorization code here');

        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            $this->error('Failed to obtain token.');
            $this->error(json_encode($token, JSON_PRETTY_PRINT));

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Successfully obtained tokens!');
        $this->newLine();

        $this->table(
            ['Key', 'Value'],
            collect($token)
                ->map(fn($value, $key) => [$key, is_array($value) ? json_encode($value) : $value])
                ->values()
                ->all()
        );

        if (isset($token['refresh_token'])) {
            $this->newLine();
            $this->warn('Save this in your .env file:');
            $this->line('');
            $this->line('GMAIL_REFRESH_TOKEN=' . $token['refresh_token']);
            $this->line('');
        } else {
            $this->warn('No refresh token was returned.');
            $this->warn('Google only returns a refresh token the first time you grant consent.');
            $this->warn('If needed, revoke the app from your Google Account and try again.');
        }

        return self::SUCCESS;
    }
}