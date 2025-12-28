'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { Button } from './ui/button';
import { getAuth, signOut } from 'firebase/auth';

export function MainSidebar() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const pathname = usePathname();
  const { user } = useUser();
  const auth = getAuth();

  const menuItems = [
    { href: '/chat', icon: Icons.Chat, label: 'Chat' },
    { href: '/memory', icon: Icons.Memory, label: 'Memory' },
    { href: '/settings', icon: Icons.Settings, label: 'Settings' },
  ];

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <Icons.Bot className="size-8 text-primary" />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Pandora's Box
            </h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} asChild>
              <SidebarMenuButton
                tooltip={item.label}
                isActive={pathname === item.href}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {user && (
                <Avatar className="size-6">
                  {user.photoURL && <AvatarImage src={user.photoURL} alt="User Avatar" />}
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              )}
              <span>{user?.email ?? 'Profile'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <Icons.Logout />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
