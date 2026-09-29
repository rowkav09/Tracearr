import { Outlet } from 'react-router';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppSidebar } from './AppSidebar';
import { SiteHeader } from './SiteHeader';
import { StatusBanners } from './StatusBanners';
<<<<<<< HEAD
import { WhatsNewAutoOpen } from '@/components/whats-new/WhatsNewAutoOpen';
import { useStreamCountTitle } from '@/hooks/useDocumentTitle';

export function Layout() {
  useStreamCountTitle();

=======

export function Layout() {
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <StatusBanners />
<<<<<<< HEAD
        <WhatsNewAutoOpen />
=======
>>>>>>> e10e89cd (Limit image ownership changes to writable data)
        <ScrollArea className="flex-1">
          <main className="p-6">
            <Outlet />
          </main>
        </ScrollArea>
      </SidebarInset>
    </SidebarProvider>
  );
}
