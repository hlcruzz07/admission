import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CampusProps } from '@/types/entities/campus';
import { Head, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { CalendarPlus2Icon, PencilIcon, PlusIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import AddSchedule from './Modal/AddSchedule';
import CreateVenue from './Modal/CreateVenue';
import EditSchedule from './Modal/EditSchedule';
import EditVenue from './Modal/EditVenue';

type PageProps = {
    campus: CampusProps;
    total_slots: number;
};

export default function Index() {
    const { campus, total_slots } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${campus?.name} Campus `,
            href: `/campus/${campus?.id}`,
        },
    ];
    const [openCreateVenue, setOpenCreateVenue] = useState(false);

    const [selectedData, setSelectedData] = useState<any>(null);
    const [selectedVenue, setSelectedVenue] = useState({
        id: 0 as number,
        name: '' as string,
    });

    const [openEditVenue, setOpenEditVenue] = useState(false);
    const [openEditTimes, setOpenEditTimes] = useState(false);
    const [openAddSchedule, setOpenAddSchedule] = useState(false);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campus?.name} />

            <CreateVenue open={openCreateVenue} setOpen={setOpenCreateVenue} />
            <EditVenue open={openEditVenue} setOpen={setOpenEditVenue} dataVenue={selectedVenue} />
            <EditSchedule open={openEditTimes} setOpen={setOpenEditTimes} dataTimes={selectedData} />
            <AddSchedule open={openAddSchedule} setOpen={setOpenAddSchedule} dataVenue={selectedVenue} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <Card>
                    <CardHeader className="flex flex-col items-center justify-between gap-5 lg:flex-row lg:gap-0">
                        <Heading
                            title={`${campus?.name} Venue`}
                            description={`Manage and organize venue information for ${campus?.name.toLowerCase()} campus, including locations, availability, and facility details.`}
                        />
                        <Button onClick={() => setOpenCreateVenue(true)} size="sm" className="w-full lg:w-auto">
                            <PlusIcon /> Create Venue
                        </Button>
                    </CardHeader>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    {campus?.venues?.map((item, i) => (
                        <Card key={i} className="border-border/50 hover:border-border max-h-max transition-all duration-200">
                            <CardHeader className="space-y-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <HeadingSmall title={item.name} description={dayjs(item.created_at).format('MMMM D, YYYY • hh:mm A')} />

                                    <Button
                                        onClick={() => {
                                            setSelectedVenue({
                                                id: item.id,
                                                name: item.name,
                                            });
                                            setOpenEditVenue(true);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="w-full lg:w-auto"
                                    >
                                        <PencilIcon className="h-4 w-4" /> Edit
                                    </Button>
                                </div>

                                <CardContent className="bg-muted/30 rounded-2xl border p-5 shadow-sm">
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-start justify-between gap-3 border-b pb-3 lg:flex-row lg:items-center lg:gap-0">
                                            <div>
                                                <h1 className="text-base font-semibold tracking-tight">
                                                    Available Schedules{' '}
                                                    <Badge variant="secondary" className="ms-2 rounded-full px-3 py-1 text-xs">
                                                        {item.schedules?.length || 0} Schedule(s)
                                                    </Badge>
                                                </h1>

                                                <p className="text-muted-foreground text-xs">Manage venue examination schedules and slot capacity</p>
                                            </div>

                                            <Button onClick={() => setOpenAddSchedule(true)} size="sm" className="w-full lg:w-auto">
                                                <CalendarPlus2Icon /> Add Schedule
                                            </Button>
                                        </div>
                                        <div className="mt-4 grid gap-3 xl:grid-cols-2">
                                            {item.schedules?.length ? (
                                                item.schedules.map((sched, schedIndex) => {
                                                    const totalSlots = sched.times?.reduce((total, time) => total + time.slots, 0) || 0;

                                                    return (
                                                        <div
                                                            key={schedIndex}
                                                            className="group hover:border-primary/40 hover:bg-primary/5 cursor-pointer space-y-3 rounded-xl border bg-gradient-to-br from-green-600 to-green-700 p-4 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:from-green-900 dark:to-green-800"
                                                            onClick={() => {
                                                                setSelectedData(sched);
                                                                setOpenEditTimes(true);
                                                            }}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-xs font-medium tracking-wider text-white/70 uppercase">
                                                                        Schedule Date
                                                                    </p>

                                                                    <h2 className="mt-1 text-sm font-semibold">
                                                                        {dayjs(sched.schedule_date).format('MMMM D, YYYY')}
                                                                    </h2>
                                                                </div>

                                                                <Badge className="border-0 bg-white/15 text-white backdrop-blur-sm">
                                                                    #{schedIndex + 1}
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-end justify-between border-t border-white/10 pt-3">
                                                                <div>
                                                                    <p className="text-xs font-medium tracking-wider text-white/70 uppercase">
                                                                        Total Slots
                                                                    </p>

                                                                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                                                        <UsersIcon />
                                                                        {totalSlots.toLocaleString()}
                                                                    </h1>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="text-xs font-medium tracking-wider text-white/70 uppercase">
                                                                        Time Sessions
                                                                    </p>

                                                                    <h1 className="text-2xl font-bold tracking-tight">{sched.times?.length || 0}</h1>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="col-span-full rounded-xl border border-dashed py-10 text-center">
                                                    <p className="text-muted-foreground text-sm">No schedules available.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
