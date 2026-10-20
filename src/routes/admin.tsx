import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AdminLayout } from '@/components/admin/admin-layout';

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: 'Blend Studio — Admin Portal' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminRouteComponent,
});

function AdminRouteComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
