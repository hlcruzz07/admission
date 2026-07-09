import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import dayjs from 'dayjs';
import { ClockIcon, UsersIcon } from 'lucide-react';

type ViewTimesProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: {
        schedule_date: string;
        times: {
            slots: number | null;
            time: string;
        }[];
    } | null;
};

export default function ViewTimes({ open, setOpen, data }: ViewTimesProps) {
    const totalSlots = data?.times.reduce((total, time) => total + Number(time.slots ?? 0), 0) || 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>View Time & Slots</DialogTitle>

                    <DialogDescription>View schedule time sessions and available slots</DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="rounded-xl border bg-gradient-to-br from-green-600 to-green-700 p-4 text-white dark:from-green-900 dark:to-green-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs tracking-wider text-white/70 uppercase">Schedule Date</p>

                                <h2 className="text-lg font-semibold">{dayjs(data?.schedule_date).format('MMMM D, YYYY')}</h2>
                            </div>

                            <Badge className="border-0 bg-white/15 text-white">{data?.times.length} Sessions</Badge>
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">
                            <p className="text-xs tracking-wider text-white/70 uppercase">Total Slots</p>

                            <div className="mt-1 flex items-center gap-2 text-3xl font-bold">
                                <UsersIcon className="size-5" />
                                {totalSlots}
                            </div>
                        </div>
                    </div>

                    <div className="no-scrollbar max-h-[40vh] space-y-3 overflow-y-auto">
                        {data?.times.map((time, index) => (
                            <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 text-primary rounded-lg p-2">
                                        <ClockIcon className="size-4" />
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-xs">Time Session</p>

                                        <h2 className="font-semibold">{dayjs(`2000-01-01 ${time.time}`).format('hh:mm A')}</h2>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-muted-foreground text-xs">Slots</p>

                                    <h2 className="text-lg font-bold">{time.slots}</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
