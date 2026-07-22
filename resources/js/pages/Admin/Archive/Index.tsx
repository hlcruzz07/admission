import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Archive as ArchiveIcon, Building2, CalendarClock, Clock3, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type ArchiveType = 'Venue' | 'Schedule' | 'Schedule Time';

interface ArchiveItem {
    id: number;
    type: ArchiveType;
    name: string;
    deleted_at: string;
}

interface Props {
    archive: ArchiveItem[];
}

const TYPE_BADGE_VARIANT: Record<ArchiveType, string> = {
    Venue: 'bg-chart-1/15 text-chart-1 hover:bg-chart-1/15',
    Schedule: 'bg-chart-2/15 text-chart-2 hover:bg-chart-2/15',
    'Schedule Time': 'bg-chart-3/15 text-chart-3 hover:bg-chart-3/15',
};

// Maps each archive type to the route segment used for its restore endpoint.
// Adjust these slugs to match your actual backend routes.
const TYPE_ROUTE_SEGMENT: Record<ArchiveType, string> = {
    Venue: 'venues',
    Schedule: 'schedules',
    'Schedule Time': 'schedule-times',
};

function formatDate(value: string) {
    return new Date(value).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function timeAgo(value: string) {
    const diffMs = Date.now() - new Date(value).getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Archive',
        href: '/admin/archive',
    },
];

export default function Index({ archive }: Props) {
    const [restoringKey, setRestoringKey] = useState<string | null>(null);

    const stats = useMemo(() => {
        const counts: Record<ArchiveType, number> = {
            Venue: 0,
            Schedule: 0,
            'Schedule Time': 0,
        };
        for (const item of archive) {
            counts[item.type]++;
        }
        const mostRecent = archive[0]?.deleted_at;
        return { counts, total: archive.length, mostRecent };
    }, [archive]);

    function handleRestore(item: ArchiveItem) {
        const key = `${item.type}-${item.id}`;

        if (!confirm(`Restore this ${item.type.toLowerCase()}?`)) {
            return;
        }

        setRestoringKey(key);

        router.patch(
            `/admin/${TYPE_ROUTE_SEGMENT[item.type]}/${item.id}/restore`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setRestoringKey(null),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Archive" />

            <div className="m-5 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Total archived</CardTitle>
                            <ArchiveIcon className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-foreground text-2xl font-semibold">{stats.total}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Venues</CardTitle>
                            <Building2 className="text-chart-1 h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-foreground text-2xl font-semibold">{stats.counts.Venue}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Schedules</CardTitle>
                            <CalendarClock className="text-chart-2 h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-foreground text-2xl font-semibold">{stats.counts.Schedule + stats.counts['Schedule Time']}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-muted-foreground text-sm font-medium">Last deleted</CardTitle>
                            <Clock3 className="text-chart-3 h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-foreground text-2xl font-semibold">{stats.mostRecent ? timeAgo(stats.mostRecent) : '—'}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
                    <div className="border-border border-b px-6 py-4">
                        <p className="text-muted-foreground text-sm">Deleted venues, schedules, and schedule times, most recent first.</p>
                    </div>

                    {archive.length === 0 ? (
                        <div className="text-muted-foreground px-6 py-12 text-center text-sm">
                            Nothing here yet. Deleted records will show up in this list.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Deleted at</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {archive.map((item) => {
                                    const key = `${item.type}-${item.id}`;
                                    const isRestoring = restoringKey === key;

                                    return (
                                        <TableRow key={key}>
                                            <TableCell>
                                                <Badge className={TYPE_BADGE_VARIANT[item.type]} variant="secondary">
                                                    {item.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-foreground font-medium">{item.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(item.deleted_at)}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" disabled={isRestoring} onClick={() => handleRestore(item)}>
                                                    <RotateCcw className={isRestoring ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />
                                                    Restore
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
