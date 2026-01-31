'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  FileText,
  MessageSquarePlus,
  Compass,
  Star,
} from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { UserNav } from './user-nav';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/agents', icon: Bot, label: 'My Agents' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/logs', icon: FileText, label: 'Logs' },
  { href: '/feedback', icon: MessageSquarePlus, label: 'Feedback' },
];

export function MainSidebar() {
  const pathname = usePathname();

  const isNavItemActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    // Special handling for /agents/[id] routes
    if (href === '/agents') return pathname.startsWith('/agents');
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-lg font-semibold">AutoPilot AI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isNavItemActive(item.href)}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              variant="outline"
              tooltip="Star us on GitHub!"
            >
              <a
                href="https://github.com/kansakapura-ctrl/my-firebase-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star />
                <span>Star on GitHub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserNav />
      </SidebarFooter>
    </>
  );
}
