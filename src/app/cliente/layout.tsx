import { ProtectedLayout } from '@/components/ProtectedLayout'

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout requiredRole="client">{children}</ProtectedLayout>
}
