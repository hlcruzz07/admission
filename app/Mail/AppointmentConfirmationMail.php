<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $studentName,
        public readonly string $successUrl,
    ) {
        //
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Appointment Confirmation',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.appointment-confirmation',
            with: [
                'studentName' => $this->studentName,
                'successUrl' => $this->successUrl,
            ],
        );
    }
}