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
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { AsteriskIcon, ChevronDownIcon, DeleteIcon, PlusIcon, SaveIcon, TrashIcon, UsersIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDelete } from './ConfirmDelete';

type EditScheduleProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    dataTimes: {
        id: number;
        schedule_date: string;
        times: {
            id: number;
            slots: number | null;
            time: string;
        }[];
    };
};

type FormData = {
    schedule_date: string;
    times: {
        id?: number;
        slots: number | null;
        time: string;
    }[];
};

export default function EditSchedule({ open, setOpen, dataTimes }: EditScheduleProps) {
    const { data, setData, errors, clearErrors, processing, put } = useForm<FormData>({
        schedule_date: '',
        times: [],
    });

    useEffect(() => {
        if (!dataTimes || !open) return;

        setData({
            schedule_date: dataTimes.schedule_date,
            times: dataTimes.times.map((time) => ({
                id: time.id,
                slots: time.slots,
                time: time.time.slice(0, 5),
            })),
        });
    }, [dataTimes, open]);

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
            data?.times?.filter((_, i) => i !== index),
        );
    };

    const handleTimeChange = (index: number, value: string) => {
        const updated = [...data?.times];

        updated[index] = {
            ...updated[index],
            time: value,
        };

        setData('times', updated);
    };

    const handleSlotsChange = (index: number, value: number) => {
        const updated = [...data?.times];

        updated[index] = {
            ...updated[index],
            slots: value,
        };

        setData('times', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!dataTimes) return;

        if (processing) return;

        put(route('update.schedule', dataTimes?.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
            },
            onError: (error) => {
                setOpen(true);
                handleErrors(error);
            },
        });
    };

    const handleDelete = () => {
        router.delete(route('delete.schedule', dataTimes.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenConfirmDelete(false);
                setOpen(false);
            },
            onError: () => {
                setOpenConfirmDelete(true);
            },
        });
    };

    const [openDate, setOpenDate] = useState(false);
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl" showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Time & Slots</DialogTitle>

                    <DialogDescription>Update schedule sessions and slots</DialogDescription>
                </DialogHeader>

                <ConfirmDelete open={openConfirmDelete} setOpen={setOpenConfirmDelete} onConfirm={handleDelete} />

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-xl border bg-gradient-to-br from-green-600 to-green-700 p-4 text-white dark:from-green-900 dark:to-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs tracking-wider text-white/70 uppercase">Schedule Date</p>

                                <h2 className="text-lg font-semibold">{dayjs(data.schedule_date).format('MMMM D, YYYY')}</h2>
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
                    </Field>

                    <InputError message={errors['schedule_date']} />

                    <div className="no-scrollbar max-h-[40vh] space-y-4 overflow-y-auto pe-4" ref={scrollRef}>
                        {data?.times?.map((time, index) => (
                            <div
                                key={index}
                                className={`rounded-lg border p-3 transition-colors ${
                                    !dataTimes?.times[index] ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'border-border'
                                }`}
                            >
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

                                    <div className="flex grow flex-col gap-2">
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
                                                disabled={index === 0}
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
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>

                        <Button type="button" onClick={() => setOpenConfirmDelete(true)} variant="destructive" disabled={processing || !open}>
                            {processing ? (
                                <>
                                    <SpinnerCustom />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <TrashIcon />
                                    Delete
                                </>
                            )}
                        </Button>

                        <Button type="submit" disabled={processing || !open}>
                            {processing ? (
                                <>
                                    <SpinnerCustom />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
