# SDR — Bot de Vendas Automatizado

> **Status:** `Planejado / Não implementado`
> **Última atualização:** 2026-03-18

---

## Visão Geral

O SDR (Sales Development Representative) automatizado é um bot de WhatsApp que deve qualificar leads antes de encaminhá-los para a lista de espera de uma influenciadora. O objetivo é automatizar a triagem inicial de empresas interessadas em contratar divulgações, reduzindo o trabalho manual da influenciadora.

---

## Arquitetura Planejada

```
WhatsApp (Evolution API)
         │
         ▼
   n8n (workflow)
         │
         ├── Recebe mensagem do lead
         ├── Consulta/atualiza sdr_sessions (Supabase)
         ├── Processa resposta conforme etapa do funil
         └── Envia próxima mensagem via Evolution API
                          │
                          ▼
               Qualificado? → POST /api/waitlist
               Não qualificado? → encerra sessão
```

---

## Tabela `sdr_sessions` (Planejada)

> Esta tabela ainda não existe no banco. Deve ser criada antes da implementação do bot.

```sql
CREATE TABLE sdr_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp      text NOT NULL,
  influencer_id uuid REFERENCES influencers(id),
  etapa         text NOT NULL DEFAULT 'inicio',
  dados         jsonb,
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
```

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` | Identificador da sessão |
| `whatsapp` | `text` | Número do lead (chave de sessão) |
| `influencer_id` | `uuid` | Influenciadora cujo link iniciou o fluxo |
| `etapa` | `text` | Etapa atual do funil (ver abaixo) |
| `dados` | `jsonb` | Dados coletados progressivamente |
| `criado_em` | `timestamptz` | Início da sessão |
| `atualizado_em` | `timestamptz` | Última interação |

---

## Funil do SDR (Etapas Planejadas)

| Etapa | Mensagem enviada | Dado coletado |
|-------|-----------------|---------------|
| `inicio` | Boas-vindas + "Qual é o seu nome?" | — |
| `nome` | "Qual é o nome da sua empresa?" | `nome` |
| `empresa` | "Qual produto ou serviço você quer divulgar?" | `empresa` |
| `produto` | "Qual é o seu orçamento mensal para marketing?" | `descricao_produto` |
| `orcamento` | "Você tem alguma data preferida para o início?" | `orcamento` |
| `data` | Confirmação + "Posso te encaminhar para a influenciadora?" | `data_preferida` |
| `confirmacao` | "Perfeito! Você foi adicionado à lista de espera." | — |
| `encerrado` | — (sessão finalizada) | — |

---

## Integração com a Plataforma

Ao chegar na etapa `confirmacao`, o workflow n8n deve chamar:

```
POST /api/waitlist
{
  "nome": "...",
  "whatsapp": "...",
  "empresa": "...",
  "mensagem": "...",
  "influencer_id": "..."
}
```

A partir daí, o lead entra no fluxo normal da plataforma:
- Influenciadora vê o lead em `/painel/lista-espera`
- Pode aprovar (cria cliente) ou rejeitar

---

## Implementação n8n

O workflow n8n deve:

1. Ser acionado por webhook da Evolution API (mensagem recebida)
2. Buscar ou criar sessão em `sdr_sessions` pelo número de WhatsApp
3. Determinar próxima etapa com base na `etapa` atual e na mensagem recebida
4. Atualizar `dados` e `etapa` na sessão
5. Enviar resposta via Evolution API
6. Na etapa final, chamar `POST /api/waitlist` e marcar sessão como `encerrado`

---

## Pendências

- [ ] Criar tabela `sdr_sessions` no Supabase
- [ ] Criar workflow n8n
- [ ] Configurar webhook na Evolution API
- [ ] Definir mensagens e regras de qualificação por nicho
- [ ] Adicionar campo `sdr_session_id` em `waitlist` para rastreabilidade
- [ ] Documentar variáveis de ambiente do n8n
