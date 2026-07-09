import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { FlashMessages } from '@/types/flash';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Props = {
    children: React.ReactNode;
};
export default function StudentLayout({ children }: Props) {
    const flash: FlashMessages = usePage().props.flash || {};

    useEffect(() => {
        if (!flash) return;

        // Small delay to prevent duplicate toasts in StrictMode
        const timeoutId = setTimeout(() => {
            if (flash.success) toast.success(flash.success);
            if (flash.error) toast.error(flash.error);
            if (flash.info) toast.info(flash.info);
            if (flash.warning) toast.warning(flash.warning);
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [flash]);
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-[url('/chmsu.webp')] bg-cover bg-fixed bg-center bg-no-repeat">
            <div className="dark:bg-background fixed top-5 right-5 z-100 rounded-lg bg-[var(--main-color)] text-white">
                <AppearanceToggleDropdown />
            </div>
            <div className="absolute inset-0 bg-black/50 dark:bg-black/80" />
            {children}
        </div>
    );
}
