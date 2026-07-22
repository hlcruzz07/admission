import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SpinnerCustom } from '@/components/ui/spinner';
import { handleErrors } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { AsteriskIcon, ChevronDownIcon, DeleteIcon, PlusIcon, SaveIcon, UsersIcon } from 'lucide-react';
import { useRef, useState } from 'react';

type AddScheduleProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    dataVenue: {
        id: number;
        name: string;
    } | null;
};

type FormData = {
    schedule_date: string;
    times: {
        slots: number | null;
        time: string;
    }[];
};

export default function AddSchedule({ open, setOpen, dataVenue }: AddScheduleProps) {
    const { data, setData, errors, clearErrors, processing, post, reset } = useForm<FormData>({
        schedule_date: '',
        times: [
            {
                slots: null,
                time: '',
            },
        ],
    });

    const [openDate, setOpenDate] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const totalSlots = data?.times?.reduce((total, time) => total + Number(time.slots ?? 0), 0) || 0;

    const handleAddTime = () => {
        setData('times', [
            ...data.times,
            {
                slots: null,
                time: '',
            },
        ]);

        setTimeout(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }, 0);
    };

    const handleRemoveTime = (index: number) => {
        setData(
            'times',
            data.times.filter((_, i) => i !== index),
        );
    };

    const handleTimeChange = (index: number, value: string) => {
        const updated = [...data.times];

        updated[index] = {
            ...updated[index],
            time: value,
        };

        setData('times', updated);
    };

    const handleSlotsChange = (index: number, value: number) => {
        const updated = [...data.times];

        updated[index] = {
            ...updated[index],
            slots: value,
        };

        setData('times', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!dataVenue) return;

        if (processing) return;

        post(route('create.schedule', dataVenue?.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
            },
            onError: (error) => {
                setOpen(true);
                handleErrors(error);
            },
        });
    };

    return (
        <Dialog open={open || processing} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Schedule</DialogTitle>

                    <DialogDescription>Create a new schedule with sessions and slots</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-xl border bg-gradient-to-br from-green-600 to-green-700 p-4 text-white dark:from-green-900 dark:to-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs tracking-wider text-white/70 uppercase">Schedule Date</p>

                                <h2 className="text-lg font-semibold">
                                    {data.schedule_date ? dayjs(data.schedule_date).format('MMMM D, YYYY') : 'No Date Selected'}
                                </h2>
                            </div>

                            <Badge className="border-0 bg-white/15 text-white">{data.times.length} Sessions</Badge>
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="text-xs tracking-wider text-white/70 uppercase">Total Slots</p>

                            <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                <UsersIcon className="size-5" />

                                {totalSlots.toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <Field>
                        <FieldLabel>
                            Schedule Date <AsteriskIcon size={12} color="red" />
                        </FieldLabel>

                        <Popover modal={true} open={openDate} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" className="w-full justify-between font-normal">
                                    {data.schedule_date ? format(new Date(data.schedule_date), 'PPP') : 'Select date'}

                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={data.schedule_date ? new Date(data.schedule_date) : undefined}
                                    captionLayout="dropdown"
                                    defaultMonth={data.schedule_date ? new Date(data.schedule_date) : undefined}
                                    onSelect={(selectedDate) => {
                                        if (!selectedDate) return;

                                        setData('schedule_date', format(selectedDate, 'yyyy-MM-dd'));

                                        setOpenDate(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <InputError message={errors['schedule_date']} />
                    </Field>

                    <div className="no-scrollbar max-h-[40vh] space-y-4 overflow-y-auto pe-4" ref={scrollRef}>
                        {data.times.map((time, index) => (
                            <div key={index} className="rounded-lg border border-green-500 bg-green-50 p-3 transition-colors dark:bg-green-950/20">
                                <div className="flex gap-3">
                                    <Field className="w-max">
                                        <FieldLabel>
                                            Time <AsteriskIcon size={12} color="red" />
                                        </FieldLabel>

                                        <Input
                                            type="time"
                                            value={time.time}
                                            onChange={(e) => handleTimeChange(index, e.target.value)}
                                            className="bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                                        />

                                        <InputError message={(errors as any)[`times.${index}.time`]} />
                                    </Field>

                                    <div className="flex grow flex-col justify-between">
                                        <div className="flex items-end gap-2">
                                            <Field className="flex-1">
                                                <FieldLabel>
                                                    Slots <AsteriskIcon size={12} color="red" />
                                                </FieldLabel>

                                                <Input
                                                    type="number"
                                                    placeholder="Enter Slot Number"
                                                    value={time.slots ?? ''}
                                                    onChange={(e) => handleSlotsChange(index, e.target.value as any)}
                                                />
                                            </Field>

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                disabled={data.times.length === 1}
                                                onClick={() => handleRemoveTime(index)}
                                            >
                                                <DeleteIcon />
                                            </Button>
                                        </div>

                                        <InputError message={(errors as any)[`times.${index}.slots`]} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button type="button" variant="secondary" className="w-full" onClick={handleAddTime}>
                        <PlusIcon />
                        Add More Time
                    </Button>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    clearErrors();
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing || !open}>
                            {processing ? (
                                <>
                                    <SpinnerCustom />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon />
                                    Create Schedule
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
