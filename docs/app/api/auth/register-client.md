# POST /api/auth/register/client

> **Status:** `Implementado`
> **Auth:** `Pública`
> **Arquivo:** `src/app/api/auth/register/client/route.ts`

## O que faz

Cria o perfil empresarial do cliente após o usuário já ter sido criado no Supabase Auth. Insere um registro em `client_profiles` e cria a entrada em `user_roles` com role `client`. Suporta Pessoa Jurídica (PJ) e Pessoa Física (PF).

## Request

**Headers:**
```
Content-Type: application/json
```

**Body (PJ):**
```json
{
  "user_id": "uuid-do-usuario-supabase",
  "tipo_pessoa": "pj",
  "nome": "Nome do Responsável",
  "email": "responsavel@empresa.com",
  "whatsapp": "11999999999",
  "cnpj": "00.000.000/0000-00",
  "razao_social": "Empresa LTDA",
  "endereco": "Rua das Flores, 123 - São Paulo/SP"
}
```

**Body (PF):**
```json
{
  "user_id": "uuid-do-usuario-supabase",
  "tipo_pessoa": "pf",
  "nome": "Nome Completo",
  "email": "pessoa@email.com",
  "whatsapp": "11999999999",
  "cpf": "000.000.000-00",
  "endereco": "Rua das Flores, 123 - São Paulo/SP"
}
```

## Response (sucesso)

**Status:** `201`
```json
{ "message": "Conta criada com sucesso!" }
```

## Erros possíveis

| HTTP | Quando | Mensagem |
|------|--------|----------|
| 400 | `user_id`, `nome`, `whatsapp` ou `tipo_pessoa` ausentes | `"user_id, nome, whatsapp e tipo_pessoa são obrigatórios"` |
| 400 | PJ sem `cnpj` ou `razao_social` | `"Pessoa Jurídica requer cnpj e razao_social"` |
| 400 | PF sem `cpf` | `"Pessoa Física requer cpf"` |
| 500 | Erro no banco de dados | `"Erro interno do servidor"` |

## Regras de negócio aplicadas

- [RN-05] Validação de campos obrigatórios condicionais por tipo de pessoa
- [RN-06] CPF/CNPJ é armazenado apenas para o tipo correspondente (null para o outro)
- [RN-07] Role `client` é criado em `user_roles` garantindo acesso correto após login

## Exemplo de uso no frontend

```typescript
// Em CadastroCliente.tsx, após supabase.auth.signUp
const res = await fetch('/api/auth/register/client', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id, tipo_pessoa, nome, email, whatsapp, cnpj, razao_social, endereco }),
})
```
