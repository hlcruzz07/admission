import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

type ConfirmOpenAdmission = {
    open: boolean;
    setOpen: (oepn: boolean) => void;
    admissionIsOpen: boolean;
    onConfirm: () => void;
    isProcessing: boolean;
};
export default function ConfirmOpenAdmission({ open, setOpen, admissionIsOpen, onConfirm, isProcessing }: ConfirmOpenAdmission) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm {admissionIsOpen ? 'Closing' : 'Opening'} Admission Period</DialogTitle>
                    <DialogDescription className="pt-2">
                        {admissionIsOpen ? (
                            <span className="font-medium text-red-500">
                                Warning: Closing admission stops all students from submitting new forms immediately.
                            </span>
                        ) : (
                            <span className="font-medium text-green-600 dark:text-green-400">
                                Attention: Opening admission allows students to begin submission and locks all schedule editing/deleting features.
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button type="button" variant={admissionIsOpen ? 'destructive' : 'default'} onClick={onConfirm} disabled={isProcessing}>
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : admissionIsOpen ? (
                            'Disable Admission'
                        ) : (
                            'Enable Admission'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
