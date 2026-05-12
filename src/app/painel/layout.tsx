import { ProtectedLayout } from '@/components/ProtectedLayout'

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout requiredRole="influencer">{children}</ProtectedLayout>
}
