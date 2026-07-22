import StudentLayout from '@/layouts/student-layout';
import { CampusProps, ScheduleProps, TimeProps, VenueProps } from '@/types/entities/campus';
import { Head, Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, Download, Home, Loader2, Mail, MapPin, User } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SuccessStudentProps {
    id: number;
    fname: string;
    mname?: string | null;
    lname: string;
    suffix?: string | null;
    birthdate: string;
    email: string;
}

export interface SuccessScheduleProps {
    campus: CampusProps;
    venue: VenueProps;
    schedule: ScheduleProps;
    time: TimeProps;
}

interface Props {
    student: SuccessStudentProps;
    schedule: SuccessScheduleProps;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(time24: string): string {
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function formatLongDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatBirthdate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function fullName(student: SuccessStudentProps): string {
    const base = [student.fname, student.mname, student.lname].filter(Boolean).join(' ');
    return student.suffix ? `${base} ${student.suffix}` : base;
}

function fileSafeName(student: SuccessStudentProps): string {
    return [student.fname, student.lname]
        .filter(Boolean)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '');
}

function ticketNumber(student: SuccessStudentProps): string {
    return `CHMSU-${String(student.id).padStart(6, '0')}`;
}

// Deterministic pseudo-barcode: derives bar widths from the ticket number so
// the same student always renders the same pattern.
function barcodeWidths(seed: string): number[] {
    const widths: number[] = [];
    for (let i = 0; i < seed.length; i++) {
        const code = seed.charCodeAt(i);
        widths.push((code % 4) + 1);
    }
    // pad out to a consistent, receipt-like bar count
    while (widths.length < 34) {
        widths.push(((widths.length * 7) % 4) + 1);
    }
    return widths;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Index({ student, schedule }: Props) {
    const { campus, venue, schedule: scheduleDay, time } = schedule;
    const ticketRef = useRef<HTMLDivElement>(null);
    const [downloading, setDownloading] = useState(false);

    const refNo = useMemo(() => ticketNumber(student), [student]);
    const bars = useMemo(() => barcodeWidths(refNo), [refNo]);
    const issuedOn = useMemo(() => formatShortDate(new Date().toISOString()), []);

    // -----------------------------------------------------------------
    // Basic deterrents against casual right-click / save / inspect.
    // NOTE: this is a UX deterrent only, not real protection — DevTools
    // can still be opened from the browser menu, and the ticket data is
    // already present in the rendered page regardless of these guards.
    // -----------------------------------------------------------------
    useEffect(() => {
        const blockContextMenu = (e: MouseEvent) => e.preventDefault();

        const blockShortcuts = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            const blocked =
                key === 'f12' || (isCtrlOrCmd && ['s', 'u', 'p'].includes(key)) || (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c', 'k'].includes(key));

            if (blocked) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('keydown', blockShortcuts, true);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', blockShortcuts, true);
        };
    }, []);

    async function handleDownloadPdf() {
        if (!ticketRef.current || downloading) return;

        setDownloading(true);
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);

            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 48;
            const imgWidth = pageWidth - margin * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', margin, 72, imgWidth, imgHeight);
            pdf.save(`admission-ticket-${fileSafeName(student)}.pdf`);
        } catch (err) {
            console.error('Failed to generate PDF', err);
        } finally {
            setDownloading(false);
        }
    }

    return (
        <StudentLayout>
            <Head title="Appointment Confirmed" />

            <div className="relative z-10 flex w-full flex-col items-center gap-6 px-4 py-16">
                {/* Eyebrow + headline */}
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#2fa084] px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-[#F6F1E4] uppercase">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Appointment Confirmed
                    </span>
                    <h1 className="font-serif text-3xl font-semibold text-[#F6F1E4] sm:text-4xl">You&apos;re all set, {student.fname}.</h1>
                    <p className="max-w-md text-sm text-[#F6F1E4]/70">
                        Your admission appointment has been reserved. Print or save this ticket — present it to the personnel on the day of your
                        visit.
                    </p>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* Receipt-style admission ticket */}
                {/* ------------------------------------------------------------- */}
                <div className="w-full max-w-md">
                    <div
                        ref={ticketRef}
                        onContextMenu={(e) => e.preventDefault()}
                        className="relative flex flex-col bg-white font-mono text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.45)] select-none"
                        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
                    >
                        {/* Header */}
                        <div className="relative flex flex-col items-center gap-2 bg-[#EEF9F3] px-6 pt-7 pb-5">
                            <img src="/logo.webp" className="size-12 object-contain" draggable={false} onDragStart={(e) => e.preventDefault()} />
                            <p className="text-center text-[11px] leading-tight font-semibold tracking-[0.15em] text-[#1F6F5F] uppercase">
                                Carlos Hilado Memorial
                                <br />
                                State University
                            </p>
                            <p className="text-[10px] font-semibold tracking-[0.35em] text-[#2FA084] uppercase">Admission Appointment Ticket</p>

                            <span className="absolute top-6 right-6 rotate-[-9deg] rounded-md border-2 border-dashed border-[#2FA084] bg-white px-2.5 py-0.5 text-[9px] font-bold tracking-[0.25em] text-[#2FA084]">
                                Confirmed
                            </span>
                        </div>

                        {/* Perforation */}
                        <Perforation />

                        {/* Applicant */}
                        <div className="flex flex-col gap-1 px-6 pt-5">
                            <p className="text-[9px] font-semibold tracking-[0.3em] text-[#2FA084] uppercase">Applicant</p>
                            <h2 className="text-lg leading-tight font-bold text-[#1F6F5F]">{fullName(student)}</h2>
                            <div className="mt-1 flex flex-col gap-1 text-[11px] text-slate-500 sm:flex-row sm:gap-4">
                                <span className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-[#2FA084]" />
                                    Born {formatBirthdate(student.birthdate)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-3 w-3 text-[#2FA084]" />
                                    {student.email}
                                </span>
                            </div>
                        </div>

                        {/* Line items */}
                        <div className="flex flex-col gap-3 px-6 py-6">
                            <LineItem icon={MapPin} label="Campus" value={`${campus.name} Campus`} />
                            <LineItem icon={MapPin} label="Venue" value={venue.name} />
                            <LineItem icon={CalendarDays} label="Date" value={formatLongDate(scheduleDay.schedule_date)} />
                            <LineItem icon={Clock} label="Time" value={formatTime(time.time)} />
                        </div>

                        {/* Perforation */}
                        <Perforation />

                        {/* Instructions */}
                        <div className="bg-[#EEF9F3] px-6 py-5 text-[10.5px] leading-relaxed text-slate-600">
                            <p className="mb-1 font-semibold tracking-[0.2em] text-[#1F6F5F] uppercase">Present at entrance</p>
                            Bring a valid ID, this ticket, and your proof of registration. Arrive at least{' '}
                            <span className="font-semibold text-[#1F6F5F]">45 minutes</span> before your report time.
                        </div>

                        {/* Barcode footer */}
                        <div className="flex flex-col items-center gap-2 border-t border-dashed border-[#6FCF97] px-6 py-6">
                            <div className="flex h-10 items-end gap-[2px]">
                                {bars.map((w, i) => (
                                    <span key={i} className="bg-[#1F6F5F]" style={{ width: `${w}px`, height: i % 5 === 0 ? '100%' : '70%' }} />
                                ))}
                            </div>
                            <p className="text-[11px] font-semibold tracking-[0.3em] text-[#1F6F5F]">{refNo}</p>
                            <p className="text-[9px] tracking-[0.2em] text-slate-400 uppercase">Issued {issuedOn} · Not valid without matching ID</p>
                        </div>

                        {/* Torn bottom edge */}
                        <ZigzagEdge />
                    </div>
                    <div className="mx-auto mt-4 flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            className="flex items-center gap-2 rounded-md border border-[#F6F1E4]/30 bg-[#F6F1E4]/10 px-4 py-2 text-xs font-medium text-[#F6F1E4] transition-colors hover:bg-[#F6F1E4]/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                            {downloading ? 'Preparing PDF…' : 'Download Admission Ticket (PDF)'}
                        </button>

                        <Link
                            href={route('home')}
                            className="flex items-center gap-2 rounded-md border border-[#F6F1E4]/30 bg-transparent px-4 py-2 text-xs font-medium text-[#F6F1E4]/70 transition-colors hover:bg-[#F6F1E4]/10 hover:text-[#F6F1E4]"
                        >
                            <Home className="h-3.5 w-3.5" />
                            Back to Home
                        </Link>
                    </div>
                </div>

                <p className="max-w-md text-center text-xs text-[#F6F1E4]/50">
                    A copy of this confirmation has also been sent to {student.email}. Arrive at least 45 minutes before your scheduled time.
                </p>
            </div>
        </StudentLayout>
    );
}

// ---------------------------------------------------------------------------
// Ticket sub-components
// ---------------------------------------------------------------------------

function LineItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
    return (
        <div className="flex items-baseline gap-2">
            <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-semibold tracking-[0.25em] text-[#2FA084] uppercase">
                <Icon className="h-3 w-3" />
                {label}
            </span>
            <span className="mx-1 mb-[3px] flex-1 border-b border-dotted border-slate-300" />
            <span className="text-right text-[13px] font-semibold text-slate-800">{value}</span>
        </div>
    );
}

function Perforation() {
    return (
        <div className="relative flex items-center px-6">
            <div className="h-px w-full border-t-2 border-dashed border-[#6FCF97]" />
        </div>
    );
}

function ZigzagEdge() {
    // Repeated triangle wave matching the ticket's own paper color so it
    // reads as a torn / cut receipt edge against whatever sits behind it.
    return (
        <svg viewBox="0 0 400 16" preserveAspectRatio="none" className="block h-4 w-full text-white" aria-hidden="true">
            <polygon
                fill="currentColor"
                points="0,0 400,0 400,6 390,16 380,6 370,16 360,6 350,16 340,6 330,16 320,6 310,16 300,6 290,16 280,6 270,16 260,6 250,16 240,6 230,16 220,6 210,16 200,6 190,16 180,6 170,16 160,6 150,16 140,6 130,16 120,6 110,16 100,6 90,16 80,6 70,16 60,6 50,16 40,6 30,16 20,6 10,16 0,6"
            />
        </svg>
    );
}
