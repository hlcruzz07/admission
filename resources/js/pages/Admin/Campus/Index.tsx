import SlotStatsWidget from '@/components/Admin/SlotStatsWidget';
import Heading from '@/components/heading';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CampusProps } from '@/types/entities/campus';
import { Head, router, usePage } from '@inertiajs/react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import dayjs from 'dayjs';
import { CalendarPlus2Icon, ChevronDownIcon, ClockIcon, MapPinIcon, PencilIcon, PlusIcon, SearchIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import AddSchedule from './Modal/AddSchedule';
import { ConfirmDeleteVenue } from './Modal/ConfirmDeleteVenue';
import CreateVenue from './Modal/CreateVenue';
import EditSchedule from './Modal/EditSchedule';
import EditVenue from './Modal/EditVenue';

type PageProps = {
    campus: CampusProps;
    total_slots: number;
    total_booked_slots: number;
    total_available_slots: number;
};

export default function Index() {
    const { campus, total_slots, total_booked_slots, total_available_slots } = usePage<PageProps>().props;

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
    const [search, setSearch] = useState('');
    const [openConfirmDeleteVenue, setOpenConfirmDeleteVenue] = useState(false);

    const venues = campus?.venues ?? [];

    const filteredVenues = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return venues;
        return venues.filter((venue) => venue.name.toLowerCase().includes(query));
    }, [venues, search]);

    const handleConfirmDeleteVenue = (venueId: number) => {
        router.delete(route('delete.venue', venueId), {
            onSuccess: () => {
                setOpenConfirmDeleteVenue(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campus?.name} />

            <CreateVenue open={openCreateVenue} setOpen={setOpenCreateVenue} />
            <EditVenue open={openEditVenue} setOpen={setOpenEditVenue} dataVenue={selectedVenue} />
            <EditSchedule open={openEditTimes} setOpen={setOpenEditTimes} dataTimes={selectedData} />
            <AddSchedule open={openAddSchedule} setOpen={setOpenAddSchedule} dataVenue={selectedData} />
            <ConfirmDeleteVenue
                open={openConfirmDeleteVenue}
                setOpen={setOpenConfirmDeleteVenue}
                onConfirm={() => handleConfirmDeleteVenue(selectedVenue.id)}
            />

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

                <SlotStatsWidget
                    venueCount={venues.length}
                    totalSlots={total_slots}
                    totalBookedSlots={total_booked_slots}
                    totalAvailableSlots={total_available_slots}
                />

                {venues.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                                <MapPinIcon className="text-muted-foreground h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground text-sm font-medium">No venues yet</p>
                                <p className="text-muted-foreground text-sm">Create your first venue to start scheduling exams for this campus.</p>
                            </div>
                            <Button onClick={() => setOpenCreateVenue(true)} size="sm" className="mt-2">
                                <PlusIcon /> Create Venue
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Venues</h2>
                                <p className="text-muted-foreground text-xs">
                                    {filteredVenues.length} of {venues.length} venue{venues.length === 1 ? '' : 's'}
                                </p>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search venues..." className="pl-8" />
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {filteredVenues.length === 0 ? (
                                <div className="rounded-xl border border-dashed py-10 text-center">
                                    <p className="text-muted-foreground text-sm">No venues match "{search}".</p>
                                </div>
                            ) : (
                                <Accordion type="multiple" className="space-y-3">
                                    {filteredVenues.map((item) => {
                                        const scheduleCount = item.schedules?.length || 0;

                                        return (
                                            <AccordionItem key={item.id} value={String(item.id)} className="border-border/50 rounded-xl border">
                                                <AccordionPrimitive.Header className="flex items-center gap-2 px-4">
                                                    <AccordionPrimitive.Trigger className="group flex flex-1 items-center gap-3 py-4 text-left [&[data-state=open]>svg]:rotate-180">
                                                        <ChevronDownIcon className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-foreground truncate text-sm font-semibold">{item.name}</p>
                                                            <p className="text-muted-foreground text-xs">
                                                                {dayjs(item.created_at).format('MMMM D, YYYY • hh:mm A')}
                                                            </p>
                                                        </div>
                                                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs whitespace-nowrap">
                                                            {scheduleCount} Schedule{scheduleCount === 1 ? '' : 's'}
                                                        </Badge>
                                                    </AccordionPrimitive.Trigger>

                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedVenue({ id: item.id, name: item.name });
                                                            setOpenEditVenue(true);
                                                        }}
                                                        size="sm"
                                                        variant="outline"
                                                    >
                                                        <PencilIcon className="h-4 w-4" /> Edit
                                                    </Button>
                                                    <Button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedVenue({ id: item.id, name: item.name });
                                                            setOpenConfirmDeleteVenue(true);
                                                        }}
                                                        size="sm"
                                                        variant="destructive"
                                                    >
                                                        <TrashIcon className="h-4 w-4" /> Delete
                                                    </Button>
                                                </AccordionPrimitive.Header>

                                                <AccordionContent className="px-4">
                                                    <div className="bg-muted/30 space-y-4 rounded-2xl border p-5 shadow-sm">
                                                        <div className="flex flex-col items-start justify-between gap-3 border-b pb-3 lg:flex-row lg:items-center lg:gap-0">
                                                            <div>
                                                                <h3 className="text-sm font-semibold">Available Schedules</h3>
                                                                <p className="text-muted-foreground text-xs">
                                                                    Manage venue examination schedules and slot capacity
                                                                </p>
                                                            </div>

                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedData(item);
                                                                    setOpenAddSchedule(true);
                                                                }}
                                                                size="sm"
                                                                className="w-full lg:w-auto"
                                                            >
                                                                <CalendarPlus2Icon /> Add Schedule
                                                            </Button>
                                                        </div>

                                                        <div className="grid gap-3 xl:grid-cols-2">
                                                            {item.schedules?.length ? (
                                                                item.schedules.map((sched) => {
                                                                    const totalSlots =
                                                                        sched.times?.reduce((total, time) => total + time.slots, 0) || 0;

                                                                    return (
                                                                        <button
                                                                            key={sched.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedData(sched);
                                                                                setOpenEditTimes(true);
                                                                            }}
                                                                            className="group border-border bg-card hover:border-primary/40 hover:bg-accent/40 focus-visible:ring-ring space-y-3 rounded-xl border p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:outline-none"
                                                                        >
                                                                            <div className="flex items-start justify-between">
                                                                                <div>
                                                                                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                                                                        Schedule Date
                                                                                    </p>
                                                                                    <h2 className="text-foreground mt-1 text-sm font-semibold">
                                                                                        {dayjs(sched.schedule_date).format('MMMM D, YYYY')}
                                                                                    </h2>
                                                                                </div>
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="bg-chart-2/15 text-chart-2 border-0"
                                                                                >
                                                                                    {dayjs(sched.schedule_date).format('ddd')}
                                                                                </Badge>
                                                                            </div>

                                                                            <div className="flex items-end justify-between border-t pt-3">
                                                                                <div>
                                                                                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                                                                        Total Slots
                                                                                    </p>
                                                                                    <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
                                                                                        <UsersIcon className="text-chart-2 h-5 w-5" />
                                                                                        {totalSlots.toLocaleString()}
                                                                                    </h1>
                                                                                </div>

                                                                                <div className="text-right">
                                                                                    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                                                                        Time Sessions
                                                                                    </p>
                                                                                    <h1 className="text-foreground flex items-center justify-end gap-2 text-2xl font-bold tracking-tight">
                                                                                        <ClockIcon className="text-chart-2 h-5 w-5" />
                                                                                        {sched.times?.length || 0}
                                                                                    </h1>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="col-span-full rounded-xl border border-dashed py-10 text-center">
                                                                    <p className="text-muted-foreground text-sm">No schedules available.</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                </Accordion>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
