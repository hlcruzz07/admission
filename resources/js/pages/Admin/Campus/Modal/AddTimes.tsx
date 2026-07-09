import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SpinnerCustom } from '@/components/ui/spinner';
import { useForm } from '@inertiajs/react';
import dayjs from 'dayjs';
import { DeleteIcon, PlusIcon, SendIcon } from 'lucide-react';

type TimesFormData = {
    times: {
        slots: number | null;
        time: string;
    }[];
};

export default function AddTimes({
    open,
    setOpen,
    onAdd,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onAdd: (times: TimesFormData['times']) => void;
}) {
    const { data, setData, processing, reset, clearErrors, setError, errors } = useForm<TimesFormData>({
        times: [
            {
                slots: null,
                time: dayjs().format('HH:mm'),
            },
        ],
    });

    const handleAddTimes = () => {
        setData('times', [
            ...data.times,
            {
                slots: null,
                time: '',
            },
        ]);
    };

    const handleRemoveTime = (index: number) => {
        setData(
            'times',
            data.times.filter((_, i) => i !== index),
        );
    };

    const handleTimeChange = (index: number, value: string) => {
        const updated = [...data.times];

        updated[index].time = value;

        setData('times', updated);
    };

    const handleSlotsChange = (index: number, value: any) => {
        const updated = [...data.times];

        updated[index].slots = value;

        setData('times', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        clearErrors();

        let hasError = false;

        data.times.forEach((time, index) => {
            if (!time.time) {
                setError(`times.${index}.time` as any, 'Time is required');
                hasError = true;
            }

            if (time.slots === null || time.slots === undefined || Number(time.slots) <= 0) {
                setError(`times.${index}.slots` as any, 'Slots must be greater than 0');
                hasError = true;
            }
        });

        // check duplicate times
        const duplicateTimes = data.times.map((t) => t.time);

        const hasDuplicates = new Set(duplicateTimes).size !== duplicateTimes.length;

        if (hasDuplicates) {
            setError('times', 'Duplicate time entries are not allowed');
            hasError = true;
        }

        if (data.times.length === 0) {
            setError('times', 'Please add at least one schedule');
            hasError = true;
        }

        if (hasError) return;

        onAdd(data.times);

        setData('times', [
            {
                slots: null,
                time: dayjs().format('HH:mm'),
            },
        ]);

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Time & Slots</DialogTitle>
                    <DialogDescription>Add time and slots to the schedule</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="no-scrollbar -mx-4 max-h-[50vh] space-y-5 overflow-y-auto px-4">
                        {data.times.map((time, index) => (
                            <div className="flex gap-3" key={index}>
                                <Field className="w-max">
                                    <FieldLabel htmlFor={`time-picker-${index}`}>Time</FieldLabel>

                                    <Input
                                        type="time"
                                        id={`time-picker-${index}`}
                                        step="1"
                                        value={time.time}
                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                        className="bg-background text-foreground [color-scheme:light] dark:[color-scheme:dark]"
                                    />

                                    <InputError message={(errors as any)[`times.${index}.time`]} />
                                </Field>

                                <div className="flex grow flex-col gap-3">
                                    <div className="flex items-end gap-2">
                                        <Field className="flex-1">
                                            <FieldLabel htmlFor={`slots-${index}`}>Slots</FieldLabel>

                                            <Input
                                                type="number"
                                                id={`slots-${index}`}
                                                min={0}
                                                placeholder="Enter number of slots"
                                                value={time.slots ?? ''}
                                                onChange={(e) => handleSlotsChange(index, e.target.value)}
                                            />
                                        </Field>

                                        <Button
                                            variant="destructive"
                                            type="button"
                                            disabled={index === 0}
                                            size="icon"
                                            onClick={() => handleRemoveTime(index)}
                                        >
                                            <DeleteIcon />
                                        </Button>
                                    </div>
                                    <InputError message={(errors as any)[`times.${index}.slots`]} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <InputError message={errors['times']} />
                    <Button type="button" onClick={handleAddTimes} variant="secondary" className="w-full">
                        <PlusIcon /> Add more time & slots
                    </Button>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
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
