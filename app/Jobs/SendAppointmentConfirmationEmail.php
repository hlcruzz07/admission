<?php

namespace App\Jobs;

use App\Mail\AppointmentConfirmationMail;
use App\Models\ScheduleTime;
use App\Models\Student;
use App\Models\StudentSchedule;
use App\Services\MailAccountRotator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendAppointmentConfirmationEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [30, 120, 300];

    public function __construct(
        public readonly string $email,
        public readonly string $studentName,
        public readonly string $successUrl,
    ) {
        //
    }

    /**
     * Caps how fast this job class runs across ALL accounts combined,
     * so total outbound volume stays gentle regardless of how many
     * accounts are in rotation. Tune 'mail-send' limiter below.
     */
    public function middleware(): array
    {
        return [new RateLimited('mail-send')];
    }

    public function handle(MailAccountRotator $rotator): void
    {
        $tried = [];

        while (true) {
            $mailerName = $rotator->pickMailer($tried);

            if (!$mailerName) {
                // Either every account hit its daily cap, or every
                // remaining account is currently blocked. Retry later today
                // in case a block expires, or tomorrow if it's the cap.
                $this->release(now()->addHours(6)->diffInSeconds(now()));
                return;
            }

            try {
                Mail::mailer($mailerName)
                    ->to($this->email)
                    ->send(new AppointmentConfirmationMail($this->studentName, $this->successUrl));

                $rotator->recordSent($mailerName);

                Student::where('email', $this->email)
                    ->first()?->schedule()?->update([
                            'email_sent_at' => now(),
                        ]);

                return; // success, stop here
            } catch (Throwable $e) {
                $tried[] = $mailerName;

                $severity = $rotator->classifyFailure($e);
                $ttl = $severity === 'permanent'
                    ? now()->endOfDay()->diffInSeconds(now()) // parked for rest of the day
                    : 3600; // 1 hour cooldown for transient errors

                $rotator->markBlocked($mailerName, $ttl);

                Log::warning('Mail account failed, rotating to next', [
                    'mailer' => $mailerName,
                    'email' => $this->email,
                    'severity' => $severity,
                    'error' => $e->getMessage(),
                ]);

                // loop continues → tries the next available mailer immediately
            }
        }
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send appointment confirmation email', [
            'email' => $this->email,
            'error' => $exception->getMessage(),
        ]);
    }
}