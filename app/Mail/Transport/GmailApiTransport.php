<?php

namespace App\Mail\Transport;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\Message as GmailMessage;
use RuntimeException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Email;

class GmailApiTransport extends AbstractTransport
{
    public function __construct(protected int $accountIndex)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        $original = $message->getOriginalMessage();

        if (!$original instanceof Email) {
            throw new RuntimeException('GmailApiTransport only supports Email messages.');
        }

        $client = new Client();
        $client->setClientId(env("GMAIL_ACCOUNT_{$this->accountIndex}_CLIENT_ID"));
        $client->setClientSecret(env("GMAIL_ACCOUNT_{$this->accountIndex}_CLIENT_SECRET"));
        $client->setRedirectUri(env('GMAIL_REDIRECT_URI', 'http://localhost'));
        $client->addScope(Gmail::GMAIL_SEND);
        $client->refreshToken(env("GMAIL_ACCOUNT_{$this->accountIndex}_REFRESH_TOKEN"));

        $service = new Gmail($client);

        $fromAddress = env("GMAIL_ACCOUNT_{$this->accountIndex}_ADDRESS");
        if ($fromAddress) {
            $original->from($fromAddress);
        }

        $rawMessage = new GmailMessage();
        $rawMessage->setRaw($this->base64UrlEncode($original->toString()));

        $service->users_messages->send('me', $rawMessage);
    }

    protected function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public function __toString(): string
    {
        return "gmail_api+{$this->accountIndex}";
    }
}