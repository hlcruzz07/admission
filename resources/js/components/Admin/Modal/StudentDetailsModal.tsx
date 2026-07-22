import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Student } from '@/types/entities/student';
import dayjs from 'dayjs';
import { CalendarDays, Clock, Mail, MailCheck, MailWarning, MapPin, User } from 'lucide-react';

interface StudentDetailsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    student: Student | null;
}

function formatTime(time24?: string): string {
    if (!time24) return '—';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

function fullName(student: Student): string {
    if (student.full_name) return student.full_name;
    const base = [student.fname, student.mname, student.lname].filter(Boolean).join(' ');
    return student.suffix ? `${base} ${student.suffix}` : base;
}

export default function StudentDetailsModal({ open, setOpen, student }: StudentDetailsModalProps) {
    if (!student) return null;

    const scheduleTime = student.schedule?.schedule_time;
    const scheduleDay = scheduleTime?.schedule;
    const venue = scheduleDay?.venue;
    const campus = venue?.campus;

    const age = student.birthdate ? dayjs().diff(dayjs(student.birthdate), 'year') : null;
    const emailSent = Boolean(student.schedule?.email_sent_at);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <span className="bg-primary text-primary-foreground flex h-11 w-11 items-center justify-center rounded-full">
                            <User className="h-5 w-5" />
                        </span>
                        <div>
                            <DialogTitle className="text-lg">{fullName(student)}</DialogTitle>
                            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                <Mail className="h-3 w-3" />
                                {student.email}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* Basic info */}
                    <div className="border-border grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                        <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Birthdate</p>
                            <p className="mt-0.5">{student.birthdate ? dayjs(student.birthdate).format('MMM D, YYYY') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Age</p>
                            <p className="mt-0.5">{age !== null ? <Badge variant="secondary">{age} yrs</Badge> : '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Submitted</p>
                            <p className="mt-0.5">{student.created_at ? dayjs(student.created_at).format('MMM D, YYYY h:mm A') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Email Status</p>
                            <p className="mt-0.5">
                                {emailSent ? (
                                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                        <MailCheck className="h-3 w-3" />
                                        Sent
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <MailWarning className="h-3 w-3" />
                                        Pending
                                    </Badge>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Appointment info */}
                    <div className="border-border rounded-lg border p-3">
                        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">Appointment</p>

                        {campus ? (
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                                        <MapPin className="h-3 w-3" />
                                        Campus
                                    </p>
                                    <p className="mt-0.5">{campus.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                                        <MapPin className="h-3 w-3" />
                                        Venue
                                    </p>
                                    <p className="mt-0.5">{venue?.name ?? '—'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                                        <CalendarDays className="h-3 w-3" />
                                        Date
                                    </p>
                                    <p className="mt-0.5">
                                        {scheduleDay?.schedule_date ? dayjs(scheduleDay.schedule_date).format('MMM D, YYYY') : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase">
                                        <Clock className="h-3 w-3" />
                                        Time
                                    </p>
                                    <p className="mt-0.5">{formatTime(scheduleTime?.time)}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">No appointment scheduled.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
