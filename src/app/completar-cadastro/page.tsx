'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Zap, Upload, Building2, User } from 'lucide-react'
import Link from 'next/link'

const nichos = [
  "Moda", "Beleza", "Fitness", "Gastronomia", "Viagem",
  "Tecnologia", "Lifestyle", "Maternidade", "Pets", "Educação"
]

const formatCPF = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 11)
  return n.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

const formatCNPJ = (v: string) => {
  const n = v.replace(/\D/g, '').slice(0, 14)
  return n.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}

export default function CompletarCadastroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'cliente'

  const [loading, setLoading] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [tipoPessoa, setTipoPessoa] = useState<'pf' | 'pj'>('pj')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    nome: '', whatsapp: '', cpf: '', cnpj: '',
    razao_social: '', endereco: '',
    instagram: '', nicho: '', bio: '', seguidores: '',
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.')
        router.push('/login')
        return
      }
      setUserEmail(session.user.email || '')
      // Pré-preencher nome do Google
      const name = session.user.user_metadata?.full_name ||
                   session.user.user_metadata?.name || ''
      if (name) setForm(f => ({ ...f, nome: name }))
    })
  }, [router])

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFoto(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setFotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sessão expirada')

      let foto_url = null
      if (tipo === 'influencer' && foto) {
        const ext = foto.name.split('.').pop()
        const path = `${session.user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, foto, { upsert: true })
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          foto_url = data.publicUrl
        }
      }

      const payload: Record<string, any> = {
        supabase_token: session.access_token,
        tipo,
        nome: form.nome,
        whatsapp: form.whatsapp,
      }

      if (tipo === 'cliente') {
        payload.tipo_pessoa = tipoPessoa
        payload.endereco = form.endereco
        if (tipoPessoa === 'pf') payload.cpf = form.cpf
        if (tipoPessoa === 'pj') {
          payload.cnpj = form.cnpj
          payload.razao_social = form.razao_social
        }
      }

      if (tipo === 'influencer') {
        payload.instagram = form.instagram
        payload.nicho = form.nicho
        payload.bio = form.bio
        payload.seguidores = form.seguidores
        payload.foto_url = foto_url
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao salvar perfil')
      }

      const { role } = await res.json()

      // Trocar token para gerar JWT com role
      const exchangeRes = await fetch('/api/auth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase_token: session.access_token }),
      })

      toast.success('Cadastro concluído! Bem-vindo(a)!')

      if (role === 'influencer') router.push('/painel')
      else router.push('/cliente/explorar')

    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-1.5 mb-10">
        <Zap size={20} className="text-[#FF2D87]" />
        <span className="font-display text-2xl font-bold text-white">Agenda</span>
        <span className="font-display text-2xl font-bold text-gradient-neon">Influ</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete seu <span className="text-gradient-neon">cadastro</span>
          </h1>
          <p className="text-white/50 text-sm">
            {userEmail && <span className="text-white/70">{userEmail} • </span>}
            Precisamos de mais alguns dados para ativar sua conta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-gradient-border p-8 space-y-5">

          {/* Tipo de pessoa — apenas cliente */}
          {tipo === 'cliente' && (
            <div className="flex gap-3">
              {[
                { value: 'pj', label: 'Pessoa Jurídica', icon: Building2 },
                { value: 'pf', label: 'Pessoa Física', icon: User },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipoPessoa(t.value as 'pf' | 'pj')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
                    tipoPessoa === t.value
                      ? 'border-[#FF2D87] bg-[#FF2D87]/10 text-[#FF2D87]'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'
                  }`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
              {tipo === 'cliente' && tipoPessoa === 'pj' ? 'Nome do responsável *' : 'Nome completo *'}
            </label>
            <Input
              value={form.nome}
              onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
              required
              placeholder="Seu nome"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">WhatsApp *</label>
            <Input
              type="tel"
              value={form.whatsapp}
              onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              required
              placeholder="(11) 99999-9999"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
            />
          </div>

          {/* Campos cliente PJ */}
          {tipo === 'cliente' && tipoPessoa === 'pj' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">CNPJ *</label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm(f => ({ ...f, cnpj: formatCNPJ(e.target.value) }))}
                  required
                  placeholder="00.000.000/0000-00"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Razão Social *</label>
                <Input
                  value={form.razao_social}
                  onChange={(e) => setForm(f => ({ ...f, razao_social: e.target.value }))}
                  required
                  placeholder="Nome da empresa"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
                />
              </div>
            </>
          )}

          {/* Campos cliente PF */}
          {tipo === 'cliente' && tipoPessoa === 'pf' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">CPF *</label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm(f => ({ ...f, cpf: formatCPF(e.target.value) }))}
                required
                placeholder="000.000.000-00"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
              />
            </div>
          )}

          {/* Endereço — cliente */}
          {tipo === 'cliente' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Endereço comercial *</label>
              <Input
                value={form.endereco}
                onChange={(e) => setForm(f => ({ ...f, endereco: e.target.value }))}
                required
                placeholder="Rua, número, cidade - estado"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
              />
            </div>
          )}

          {/* Campos influencer */}
          {tipo === 'influencer' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Instagram *</label>
                <Input
                  value={form.instagram}
                  onChange={(e) => setForm(f => ({ ...f, instagram: e.target.value }))}
                  required
                  placeholder="@seuinstagram"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/25"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Nicho *</label>
                <select
                  value={form.nicho}
                  onChange={(e) => setForm(f => ({ ...f, nicho: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#13131A] text-white text-sm focus:outline-none focus:border-[#FF2D87]/50"
                >
                  <option value="">Selecione seu nicho</option>
                  {nichos.map(n => <option key={n} value={n} className="bg-[#13131A]">{n}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Bio</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Conte sobre você e seu trabalho..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-[#FF2D87]/50 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Foto de perfil</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 rounded-2xl p-8 cursor-pointer hover:border-[#FF2D87]/40 transition-colors">
                  {fotoPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <img src={fotoPreview} alt="preview" className="w-20 h-20 rounded-full object-cover ring-2 ring-[#FF2D87]/40" />
                      <p className="text-xs text-[#FF2D87]">Clique para trocar</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-white/30 mb-2" size={28} />
                      <p className="text-sm text-white/40">Clique para enviar sua foto</p>
                      <p className="text-xs text-white/25 mt-1">PNG, JPG até 5MB</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="hero"
            className="w-full h-12 text-base font-semibold btn-shimmer"
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Concluir cadastro'}
          </Button>
        </form>
      </div>
    </div>
  )
}
