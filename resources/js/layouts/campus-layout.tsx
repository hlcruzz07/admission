import Heading from '@/components/heading';
import { type NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Venues',
        url: '',
        icon: null,
    },
    {
        title: 'Schedules',
        url: '/campus/binalbagan',
        icon: null,
    },
];

type PageProps = {
    children: React.ReactNode;
    title: string;
    description: string;
};

export default function CampusLayout({ children, title, description }: PageProps) {
    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title={title} description={description} />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <div className="flex-1 md:max-w-2xl">{children}</div>
            </div>
        </div>
    );
}
