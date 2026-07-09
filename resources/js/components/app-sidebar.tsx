import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ChevronDown, ChevronRight, Folder, LayoutGrid, School2Icon, Users } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import apiService from '@/lib/api-service';
import { CampusProps } from '@/types/entities/campus';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Students',
        url: '/students',
        icon: Users,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const [campuses, setCampuses] = useState<CampusProps[]>([]);
    const page = usePage();

    useEffect(() => {
        const fetchCampuses = async () => {
            try {
                const { data } = await apiService.get(route('api.campuses'));

                setCampuses(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchCampuses();
    }, []);

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
                {/* Main Navigation */}
                <NavMain items={mainNavItems} />

                {/* Dropdown Group */}
                <SidebarGroup className="m-0 py-0">
                    <SidebarGroupContent>
                        <Collapsible>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton>
                                    <School2Icon className="h-4 w-4" />
                                    Campus
                                    <ChevronDown className="ml-auto h-4 w-4" />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-1 space-y-1">
                                <SidebarMenu>
                                    {campuses?.map((item) => (
                                        <Tooltip key={item.id}>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuItem>
                                                    <SidebarMenuButton
                                                        isActive={`/campus/${item.id}` === page.url}
                                                        asChild
                                                        className="transition-all duration-200 hover:translate-x-2"
                                                    >
                                                        <Link href={`/campus/${item.id}`}>
                                                            <ChevronRight className="h-4 w-4" />
                                                            {item.name}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{item.name}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </SidebarMenu>
                            </CollapsibleContent>
                        </Collapsible>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
