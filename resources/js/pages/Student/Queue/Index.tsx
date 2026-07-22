import QueueCard from '@/components/QueueCard';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StudentLayout from '@/layouts/student-layout';
import apiService from '@/lib/api-service';
import { getQueueMessage } from '@/lib/utils';
import { useEffect, useState } from 'react';

type PositionProps = {
    status: string;
    position: number;
    applicants_ahead: number;
    total_waiting: number;
    estimated_arrival_time: string;
    estimated_wait_minutes: number;
    estimated_wait_text: string;
    last_updated: string;
    progress_percent: number;
    token: string;
};

export default function Index() {
    const [position, setPosition] = useState<PositionProps | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const { data } = await apiService.get(route('api.queue'));

                if (data?.error) {
                    window.location.href = route('home');
                    return;
                }

                if (data?.status === 'allowed') {
                    window.location.href = route('student.form');
                    return;
                }

                if (!data?.position) {
                    window.location.href = route('home');
                    return;
                }

                setPosition(data);
                setLoading(false);
            } catch (err) {
                console.error('Error checking interval', err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <StudentLayout>
            <Card className="relative z-10 overflow-hidden rounded-none md:rounded-md md:p-5">
                {loading && (
                    <div className="bg-background/80 absolute inset-0 top-0 left-0 z-100 flex items-center justify-center rounded-md backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="border-primary size-10 animate-spin rounded-full border-4 border-t-transparent" />
                            <p className="text-muted-foreground font-medium">Loading...</p>
                        </div>
                    </div>
                )}
                <CardHeader>
                    <div className="flex flex-col items-center gap-5 md:flex-row">
                        <div className="w-20">
                            <img src="/logo.webp" alt="CHMSU" className="h-full w-full rounded-lg object-cover" />
                        </div>
                        <div className="space-y-1 text-center md:text-start">
                            <h1 className="text-primary text-2xl font-bold">Carlos Hidalo Memorial State University</h1>
                            <p className="text-muted-foreground text-lg">Admission Queue Waiting Room</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-center leading-relaxed md:text-start">
                        {getQueueMessage(position?.applicants_ahead!)}{' '}
                    </p>
                </CardHeader>
                <CardContent className="relative mt-8 space-y-5">
                    <div className="relative space-y-3">
                        <div className="absolute top-[-30px] z-10" style={{ left: `calc(${position?.progress_percent}% - 30px)` }}>
                            <div className="relative flex flex-col items-center">
                                <Badge variant="secondary" className="bg-primary hover:bg-primary text-white">
                                    {(position?.progress_percent || 0) > 1
                                        ? Math.floor(position?.progress_percent!)
                                        : (position?.progress_percent || 0).toFixed(1)}
                                    %
                                </Badge>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="var(--primary)"
                                    className="absolute bottom-[-13px] size-6"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                        <Progress value={position?.progress_percent} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Current position: <b className="text-primary">{position?.position.toLocaleString()}</b> of{' '}
                        <b className="text-primary">{position?.total_waiting.toLocaleString()}</b>
                    </p>

                    <div className="grid gap-3 md:grid-cols-2">
                        <QueueCard title="Expected time to arrive" value={position?.estimated_arrival_time} />
                        <QueueCard title="Estimated waiting time" value={position?.estimated_wait_text} />
                        <QueueCard title="Applicants ahead of you" value={position?.applicants_ahead.toLocaleString()} />
                        <QueueCard title="Status last updated" value={position?.last_updated} />
                    </div>

                    <p className="text-muted-foreground">
                        Once it's your turn, you will only have <b className="text-primary">5 minutes</b> to submit your application.
                    </p>

                    <p className="text-muted-foreground text-sm">Queue ID: {position?.token}</p>
                </CardContent>
            </Card>
        </StudentLayout>
    );
}
