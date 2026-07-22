import ThemeButton from '@/components/ThemeButton';
import { Button } from '@/components/ui/button';
import { Link, usePage } from '@inertiajs/react';
import { CalendarClock, CircleAlert, Clock, LogInIcon, MailCheck, ScrollText, ShieldCheck, Ticket, Users } from 'lucide-react';

type PageProps = {
    admissionIsOpen: boolean;
};

// Swap this array's contents for the real procedure text once you have it —
// the numbered layout below is built to take any number of steps.
const PROCEDURE_STEPS = [
    {
        title: 'Enter your details',
        body: 'Provide your email (for appointment confirmation), full name, and birthdate, then choose your preferred campus, venue, date, and time.',
    },
    {
        title: 'Join the queue',
        body: 'Tap "Enter the Queue Room" to get your spot in line. No account or sign-up is required; simply keep the page open on your device.',
    },
    {
        title: 'Wait for your turn',
        body: 'Keep the tab open. You\u2019ll see your live position and an estimated wait time update as the line moves.',
    },
    {
        title: 'Submit within 5 minutes',
        body: 'Once it\u2019s your turn, you\u2019ll have 5 minutes to complete and submit your application before you lose your spot.',
    },
    {
        title: 'Get your confirmation',
        body: 'We\u2019ll verify your details, which usually takes 1–2 days. You\u2019ll then receive an Appointment Confirmation by email containing a link to your admission ticket, which you will present on your scheduled date.',
    },
];

export default function Home() {
    const { admissionIsOpen } = usePage<PageProps>().props;

    return (
        <div className="bg-background text-foreground min-h-screen">
            {/* ---------- Nav ---------- */}
            <header className="border-border border-b">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
                    <div className="flex items-center gap-3">
                        <img src="/logo.webp" alt="CHMSU" className="h-12 w-12 rounded-md object-cover" />
                        <div className="leading-tight">
                            <p className="text-foreground text-lg font-semibold md:hidden">CHMSU</p>
                            <p className="text-foreground hidden text-lg font-semibold md:block">Carlos Hilado Memorial State University</p>
                            <p className="text-muted-foreground text-xs">Admission Portal</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium sm:flex ${
                                admissionIsOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-foreground/5 text-muted-foreground'
                            }`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${admissionIsOpen ? 'bg-emerald-500' : 'bg-foreground/30'}`} />
                            {admissionIsOpen ? 'Admissions Open' : 'Admissions Closed'}
                        </span>

                        {admissionIsOpen ? (
                            <Button asChild size="sm">
                                <Link href={route('queue.enter')}>
                                    Enter the Queue <LogInIcon className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" disabled>
                                Closed
                            </Button>
                        )}
                        <ThemeButton className="static" />
                    </div>
                </div>
            </header>

            {/* ---------- Hero ---------- */}
            <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-8 md:px-10 md:py-24">
                <div>
                    <p className="text-foreground text-xs font-semibold tracking-[0.2em] uppercase">Carlos Hilado Memorial State University</p>
                    <h1
                        className="text-foreground mt-3 text-4xl leading-[1.05] font-semibold md:text-5xl"
                        style={{ fontFamily: '"Fraunces", "Georgia", serif' }}
                    >
                        One line,
                        <br />
                        one seat at a time.
                    </h1>
                    <p className="text-foreground/70 mt-5 max-w-md text-base leading-relaxed">
                        To keep things fast and fair for every applicant, applicants are admitted through a live queue in small groups at a time,
                        rather than everyone attempting to apply at once.
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        {admissionIsOpen ? (
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                                <Link href={route('queue.enter')}>
                                    Enter the Queue Room <LogInIcon className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button size="lg" variant="outline" disabled>
                                Admission is currently closed <CircleAlert className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        <a
                            href="#how-it-works"
                            className="text-muted-foreground decoration-foreground/20 hover:text-foreground text-sm font-medium underline underline-offset-4"
                        >
                            See how it works
                        </a>
                    </div>
                    <p className="text-foreground/45 mt-3 text-xs">No account is needed. Your spot in line is assigned automatically.</p>
                </div>

                {/* Live queue preview */}
                <div className="flex justify-center md:justify-end">
                    <div className="bg-card border-primary/40 relative w-full max-w-xs rotate-[-2deg] rounded-2xl border-2 border-dashed px-6 py-7 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.25)]">
                        {/* perforation notches */}
                        <span className="bg-background absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full" />
                        <span className="bg-background absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full" />

                        <div className="border-foreground/15 flex items-center justify-between border-b border-dashed pb-4">
                            <div className="text-foreground flex items-center gap-2">
                                <Ticket className="h-4 w-4" />
                                <span className="text-xs font-semibold tracking-widest uppercase">Live Queue Preview</span>
                            </div>
                            <span className="text-foreground/40 text-[10px] tracking-widest uppercase">A.Y. 2026–2027</span>
                        </div>

                        <div className="py-6 text-center">
                            <p className="text-foreground/45 text-[11px] tracking-widest uppercase">Your position</p>
                            <p
                                className="text-foreground mt-1 text-5xl font-semibold tabular-nums"
                                style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace' }}
                            >
                                14
                            </p>
                            <p className="text-foreground/40 mt-1 text-xs">of 132 in line</p>
                        </div>

                        <div className="border-foreground/15 grid grid-cols-2 gap-3 border-t border-dashed pt-4 text-left">
                            <div>
                                <p className="text-foreground/40 text-[10px] tracking-widest uppercase">Est. wait</p>
                                <p className="text-sm font-medium">~6 min</p>
                            </div>
                            <div>
                                <p className="text-foreground/40 text-[10px] tracking-widest uppercase">Expected arrival</p>
                                <p className="text-sm font-medium">10:42 AM</p>
                            </div>
                        </div>
                        <p className="text-foreground/40 mt-4 text-center text-[10px]">You'll get 5 minutes to submit once it's your turn.</p>
                        <p className="text-foreground/35 mt-1 text-center text-[10px]">This is only an example. Your numbers will differ.</p>
                    </div>
                </div>
            </section>

            {/* ---------- Why a queue ---------- */}
            <section className="border-border bg-card border-y">
                <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 md:grid-cols-3 md:px-10">
                    <div className="flex gap-4">
                        <ShieldCheck className="text-foreground h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Fair, first-come order</h3>
                            <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                Everyone is given a spot in the order of their arrival, and no one may skip the line or apply early.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Users className="text-foreground h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-semibold">One batch at a time</h3>
                            <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                Applicants are let through in small groups so the site stays fast and doesn't slow down, even during busy enrollment
                                periods.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Clock className="text-foreground h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Live position, no guessing</h3>
                            <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                Your spot and estimated wait update in real time, so you know exactly when to return to your screen.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- How it works ---------- */}
            <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 md:px-10">
                <div className="max-w-lg">
                    <p className="text-foreground text-xs font-semibold tracking-[0.2em] uppercase">How it works</p>
                    <h2 className="mt-3 text-3xl font-semibold" style={{ fontFamily: '"Fraunces", "Georgia", serif' }}>
                        Five steps, start to finish.
                    </h2>
                </div>

                <ol className="mt-10 grid gap-6 md:grid-cols-2">
                    {PROCEDURE_STEPS.map((step, i) => (
                        <li key={step.title} className="border-border bg-card flex gap-4 rounded-xl border p-6">
                            <span
                                className="text-foreground/30 text-2xl font-semibold tabular-nums"
                                style={{ fontFamily: '"IBM Plex Mono", ui-monospace, monospace' }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div>
                                <h3 className="font-semibold">{step.title}</h3>
                                <p className="text-foreground/65 mt-1 text-sm leading-relaxed">{step.body}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            {/* ---------- Before you join ---------- */}
            <section className="border-border bg-foreground/[0.03] border-t">
                <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
                    <div className="bg-card border-primary/30 flex items-start gap-4 rounded-xl border border-dashed p-6">
                        <ScrollText className="text-foreground h-5 w-5 shrink-0" />
                        <div>
                            <h3 className="font-semibold">Before you join the queue</h3>
                            <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                Have your email, full name, birthdate, and preferred schedule (campus, venue, date, and time) ready before entering
                                the queue room. Once it is your turn, the 5-minute window starts right away and cannot be paused.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="border-border bg-card flex items-start gap-4 rounded-xl border p-6">
                            <CalendarClock className="text-foreground h-5 w-5 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Pick your schedule</h3>
                                <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                    You will choose the campus, venue, date, and time that work for you as part of your application.
                                </p>
                            </div>
                        </div>
                        <div className="border-border bg-card flex items-start gap-4 rounded-xl border p-6">
                            <MailCheck className="text-foreground h-5 w-5 shrink-0" />
                            <div>
                                <h3 className="font-semibold">Wait for your Appointment Confirmation</h3>
                                <p className="text-foreground/65 mt-1 text-sm leading-relaxed">
                                    After you submit, verification takes about 1–2 days. We will then email your Appointment Confirmation with a link
                                    to your admission ticket, which you will present on your scheduled date.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Final CTA ---------- */}
            <section className="mx-auto max-w-7xl px-6 py-20 text-center md:px-10">
                <h2 className="text-3xl font-semibold md:text-4xl" style={{ fontFamily: '"Fraunces", "Georgia", serif' }}>
                    Ready to take your spot?
                </h2>
                <p className="text-foreground/65 mx-auto mt-3 max-w-md text-sm">
                    Your place in line is assigned automatically, and you will know your position the moment you join.
                </p>
                <div className="mt-8">
                    {admissionIsOpen ? (
                        <Button asChild size="lg">
                            <Link href={route('queue.enter')}>
                                Enter the Queue Room <LogInIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button size="lg" variant="outline" disabled>
                            Admission is currently closed <CircleAlert className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </section>

            {/* ---------- Footer ---------- */}
            <footer className="border-border border-t">
                <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-10 text-center text-xs md:px-10">
                    <p>&copy; {new Date().getFullYear()} Carlos Hilado Memorial State University</p>
                    <p className="mt-1">Admission Portal</p>
                </div>
            </footer>
        </div>
    );
}
