import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Archive, Building, Building2, Landmark, LayoutGrid, School, Users } from 'lucide-react';

import { useMemo } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Students',
        url: '/admin/students',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Archive',
        url: '/admin/archive',
        icon: Archive,
    },
];

export function AppSidebar() {
    const { campuses } = usePage<any>().props;

    const CAMPUS_ICONS = [Building2, School, Landmark, Building];

    const campusNavItems: NavItem[] = useMemo(
        () =>
            campuses.map((campus: { id: number; name: string }, index: number) => ({
                title: campus.name,
                url: `/admin/campus/${campus.id}`,
                icon: CAMPUS_ICONS[index % CAMPUS_ICONS.length],
            })),
        [campuses],
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                <NavMain items={campusNavItems} label="Campus" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
