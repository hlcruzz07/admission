import StudentLayout from '@/layouts/student-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { CheckCircle2, Home, Inbox, MailCheck } from 'lucide-react';

export default function Index() {
    const { success_data } = usePage<any>().props;

    if (!success_data) {
        window.location.href = '/';
        return null;
    }

    return (
        <StudentLayout>
            <Head title="Application Submitted" />

            <div className="relative z-10 flex w-full flex-col items-center gap-8 px-4 py-20 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#2fa084] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#F6F1E4] uppercase">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Application Submitted
                </span>

                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[#2fa084]/10">
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#2fa084]/30" />
                    <MailCheck className="h-10 w-10 text-[#2fa084]" strokeWidth={1.75} />
                </div>

                <div className="flex max-w-lg flex-col gap-3">
                    <h1 className="font-serif text-3xl font-semibold text-[#F6F1E4] sm:text-4xl">Admission Appointment Scheduled Successfully!</h1>

                    <p className="text-sm leading-relaxed text-[#F6F1E4]/70">
                        Your admission application has been successfully submitted. Please wait for your Appointment Confirmation, which will be sent
                        to the email address you provided.
                    </p>
                </div>

                <div className="flex w-full max-w-xl items-start gap-3 rounded-xl border border-[#F6F1E4]/20 bg-[#1a1a1a]/60 px-5 py-4 text-left backdrop-blur-md">
                    <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-[#2fa084]" />
                    <p className="text-xs leading-relaxed text-[#F6F1E4]/70">
                        Because a large number of applicants are submitting at the same time, it usually takes 1 to 2 days for your Appointment
                        Confirmation to reach your inbox. Once it arrives, it will include a link to your admission ticket. If you do not receive it
                        after a couple of days, check your spam or junk folder.
                    </p>
                </div>

                <Link
                    href={route('home')}
                    className="mt-2 flex items-center gap-2 rounded-md border border-[#F6F1E4]/30 bg-[#1a1a1a]/50 px-5 py-2.5 text-xs font-medium text-[#F6F1E4] transition-colors hover:bg-[#1a1a1a]/70"
                >
                    <Home className="h-3.5 w-3.5" />
                    Back to Home
                </Link>
            </div>
        </StudentLayout>
    );
}
