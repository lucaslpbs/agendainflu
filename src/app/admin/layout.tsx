import { ProtectedLayout } from '@/components/ProtectedLayout'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout requiredRole="admin">{children}</ProtectedLayout>
}
