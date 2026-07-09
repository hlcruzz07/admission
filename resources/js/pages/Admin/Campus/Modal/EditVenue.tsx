import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpinnerCustom } from '@/components/ui/spinner';
import { handleErrors } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { Asterisk, SaveIcon } from 'lucide-react';
import { useEffect } from 'react';

type EditVenueProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    dataVenue: {
        id: number;
        name: string;
    } | null;
};

export default function EditVenue({ open, setOpen, dataVenue }: EditVenueProps) {
    const { data, setData, errors, put, clearErrors, processing } = useForm<{ id: number; name: string }>({
        id: 0,
        name: '',
    });

    useEffect(() => {
        if (!dataVenue || !open) return;

        setData({
            id: dataVenue?.id,
            name: dataVenue?.name,
        });
    }, [dataVenue, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        put(route('update.venue', data.id), {
            preserveScroll: true,
            onSuccess: () => {
                clearErrors();
                setOpen(false);
            },
            onError: (error) => {
                clearErrors();
                handleErrors(error);
                setOpen(true);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl" showCloseButton={false} onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>Edit Venue</DialogTitle>

                    <DialogDescription>Update venue name</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="mb-5 space-y-5">
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
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    clearErrors();
                                    setOpen(false);
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
