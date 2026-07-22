import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Shadcn UI Imports
import ConfirmOpenAdmission from '@/components/Admin/Modal/ConfirmOpenAdmission';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, MailWarning, PowerIcon, PowerOffIcon, Users } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

type QueueStats = {
    active: number;
    waiting: number;
};

type EmailHealthStats = {
    sent: number;
    pending: number;
    failed: number;
};

type RegistrationPoint = {
    date: string;
    registrations: number;
};

type PageProps = {
    admissionIsOpen: boolean;
    queue: QueueStats;
    emailHealth: EmailHealthStats;
    registrations: RegistrationPoint[];
};

export default function Dashboard() {
    const { admissionIsOpen, queue, emailHealth, registrations } = usePage<PageProps>().props;
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleToggleAdmission = () => {
        const targetStatus = admissionIsOpen ? 'closed' : 'open';

        router.post(
            route('admission.update'),
            { status: targetStatus },
            {
                preserveState: true,
                onStart: () => setIsProcessing(true),
                onSuccess: () => setConfirmOpen(false),
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <ConfirmOpenAdmission
                open={confirmOpen}
                setOpen={setConfirmOpen}
                admissionIsOpen={admissionIsOpen}
                onConfirm={handleToggleAdmission}
                isProcessing={isProcessing}
            />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {/* Widget 1: Live Admission Status Control Panel */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border p-6">
                        <div className="z-10 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-sm font-medium">Admission Status</span>
                                <Badge variant={admissionIsOpen ? 'default' : 'destructive'}>
                                    {admissionIsOpen ? 'ACTIVE (OPEN)' : 'INACTIVE (CLOSED)'}
                                </Badge>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">{admissionIsOpen ? 'Open for Submissions' : 'Submissions Blocked'}</h2>
                            <p className="text-muted-foreground text-xs leading-relaxed">
                                {admissionIsOpen
                                    ? 'Students can register and submit schedules. Modification controls are locked.'
                                    : 'Registration is offline. Admin management controls are fully editable.'}
                            </p>
                        </div>

                        <div className="z-10 mt-4">
                            <Button variant={admissionIsOpen ? 'destructive' : 'default'} className="w-full" onClick={() => setConfirmOpen(true)}>
                                {admissionIsOpen ? (
                                    <>
                                        Turn Off Admission <PowerOffIcon />
                                    </>
                                ) : (
                                    <>
                                        Turn On Admission <PowerIcon />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Widget 2: Live Queue Status */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Live Queue</span>
                            <Badge variant="secondary" className="gap-1">
                                <span className="bg-primary inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
                                Live
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col items-center gap-1 rounded-lg border p-3">
                                <Users className="text-primary h-4 w-4" />
                                <span className="text-xl font-bold tracking-tight">{queue.active}</span>
                                <span className="text-muted-foreground text-[10px] uppercase">Active</span>
                            </div>
                            <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-col items-center gap-1 rounded-lg border p-3">
                                <Clock className="text-accent-foreground h-4 w-4" />
                                <span className="text-xl font-bold tracking-tight">{queue.waiting}</span>
                                <span className="text-muted-foreground text-[10px] uppercase">Waiting</span>
                            </div>
                        </div>
                    </div>

                    {/* Widget 3: Email Delivery Health */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex aspect-video flex-col justify-between overflow-hidden rounded-xl border p-6">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Email Delivery</span>
                            <Badge variant={emailHealth.failed > 0 ? 'destructive' : 'default'}>
                                {emailHealth.failed > 0 ? `${emailHealth.failed} Failed` : 'Healthy'}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Sent
                                </span>
                                <span className="font-semibold">{emailHealth.sent.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                    Pending
                                </span>
                                <span className="font-semibold">{emailHealth.pending.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <MailWarning className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                                    Failed
                                </span>
                                <span className="font-semibold">{emailHealth.failed.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registrations over time */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Registrations Over Time</h3>
                            <p className="text-muted-foreground text-xs">Daily student registrations, last 14 days</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={500}>
                        <LineChart data={registrations}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    color: 'var(--color-foreground)',
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="registrations"
                                stroke="var(--color-chart-2)"
                                strokeWidth={2.5}
                                dot={{ r: 3, fill: 'var(--color-chart-2)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </AppLayout>
    );
}
