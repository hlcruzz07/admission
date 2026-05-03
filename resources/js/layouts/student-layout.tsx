import AppearanceToggleDropdown from '@/components/appearance-dropdown';

type Props = {
    children: React.ReactNode;
};
export default function StudentLayout({ children }: Props) {
    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-[url('/chmsu.webp')] bg-cover bg-center bg-no-repeat">
            <div className="dark:bg-background fixed top-5 right-5 z-100 rounded-lg bg-[var(--main-color)] text-white">
                <AppearanceToggleDropdown />
            </div>
            <div className="absolute inset-0 bg-black/50 dark:bg-black/80" />
            {children}
        </div>
    );
}
