import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SpinnerCustom } from '@/components/ui/spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { handleErrors } from '@/lib/utils';
import { CampusProps } from '@/types/entities/campus';
import { useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { Asterisk, CalendarPlus, ChevronDownIcon, SendIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import AddTimes from './AddTimes';
import ViewTimes from './ViewTimes';

type FormProps = {
    name: string;
    schedules: {
        schedule_date: string;
        times: {
            time: string;
            slots: number;
        }[];
    }[];
};

type SelectedData = {
    schedule_date: string;
    times: {
        time: string;
        slots: number;
    }[];
};

type PageProps = {
    campus: CampusProps;
};

export default function CreateVenue({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
    const { data, setData, processing, reset, errors, setError, clearErrors, post } = useForm<FormProps>({
        name: '',
        schedules: [],
    });

    const { campus } = usePage<PageProps>().props;

    const [date, setDate] = useState<string>('');
    const [openDate, setOpenDate] = useState(false);
    const [openAddTimes, setOpenAddTimes] = useState(false);

    const [selectedData, setSelectedData] = useState<SelectedData | null>(null);
    const [openViewTimes, setOpenViewTimes] = useState(false);

    const addSchedule = () => {
        if (!date) {
            setError('schedules', 'Select a date first');
            return;
        }
        clearErrors('schedules');
        setOpenAddTimes(true);
    };

    const deleteSchedule = (index: number) => {
        setData(
            'schedules',
            data.schedules.filter((_, i) => i !== index),
        );
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (processing) return;

        post(route('create.venue', campus.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
            },
            onError: (error) => {
                handleErrors(error);
            },
        });
    };

    return (
        <Dialog open={open || processing} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Venue</DialogTitle>
                    <DialogDescription>Create a new venue for the campus.</DialogDescription>
                </DialogHeader>
                <AddTimes
                    open={openAddTimes}
                    setOpen={setOpenAddTimes}
                    onAdd={(times) => {
                        if (!date) return;

                        setData('schedules', [
                            ...data.schedules,
                            {
                                schedule_date: date,
                                times: times.map((time) => ({
                                    time: time.time,
                                    slots: time.slots ?? 0,
                                })),
                            },
                        ]);

                        setDate('');
                    }}
                />
                <form className="space-y-5" onSubmit={handleSubmit}>
                    {selectedData && <ViewTimes open={openViewTimes} setOpen={setOpenViewTimes} data={selectedData} />}

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="name">
                            Venue Name <Asterisk size={12} color="red" />
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Enter venue name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoFocus
                        />
                        <InputError message={errors['name']} />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Label>
                            Schedules
                            <Asterisk size={12} color="red" />
                        </Label>

                        <div className="flex">
                            <Field>
                                <Popover modal={true} open={openDate} onOpenChange={setOpenDate}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            id="date-picker-optional"
                                            className="w-full justify-between rounded-e-none font-normal"
                                        >
                                            {date ? format(date, 'PPP') : 'Select date'}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date ? new Date(date) : undefined}
                                            captionLayout="dropdown"
                                            defaultMonth={date ? new Date(date) : undefined}
                                            onSelect={(selectedDate) => {
                                                if (!selectedDate) return;

                                                setDate(format(selectedDate, 'yyyy-MM-dd'));
                                                setOpenDate(false);
                                            }}
                                            disabled={(date) =>
                                                data.schedules.some(
                                                    (schedule) =>
                                                        format(new Date(schedule.schedule_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'),
                                                )
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </Field>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" onClick={addSchedule} variant="outline" size="icon" className="rounded-s-none">
                                        <CalendarPlus />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Add Schedule</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <InputError message={errors['schedules']} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {data.schedules.length > 0 &&
                            data.schedules.map((item, index) => {
                                const totalSlots = item.times?.reduce((total, time) => total + Number(time.slots ?? 0), 0) || 0;

                                return (
                                    <div
                                        key={index}
                                        className="space-y-2 rounded-lg border bg-gradient-to-br from-green-600 to-green-700 p-3 text-white shadow-sm duration-300 ease-in-out hover:translate-y-[-5px] dark:from-green-900 dark:to-green-800"
                                        onClick={() => {
                                            setSelectedData(item);
                                            setOpenViewTimes(true);
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-medium tracking-wider text-white/70 uppercase">
                                                    Schedule{' '}
                                                    <Badge className="border-0 bg-white/15 px-2 py-0 text-[10px] text-white">#{index + 1}</Badge>
                                                </p>

                                                <h2 className="text-sm font-semibold">{dayjs(item.schedule_date).format('MMM D, YYYY')}</h2>
                                            </div>

                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSchedule(index);
                                                }}
                                                type="button"
                                                className="relative z-10 size-7"
                                                variant={'destructive'}
                                            >
                                                <TrashIcon />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
                                            <div>
                                                <p className="text-[10px] tracking-wide text-white/70 uppercase">Slots</p>

                                                <div className="flex items-center gap-1 text-lg font-bold">
                                                    <UsersIcon className="size-4" />
                                                    {totalSlots}
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[10px] tracking-wide text-white/70 uppercase">Sessions</p>

                                                <h1 className="text-lg font-bold">{item.times?.length || 0}</h1>
                                            </div>
                                        </div>

                                        <InputError message={(errors as any)[`schedules.${index}.schedule_date`]} />
                                    </div>
                                );
                            })}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    reset();
                                    setDate('');
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>
                                    <SpinnerCustom />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <SendIcon /> Submit
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
