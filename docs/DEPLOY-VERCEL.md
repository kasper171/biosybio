# Deploy do Biosy na Vercel

Guia para publicar o site na Vercel saindo do Lovable, sem quebrar o que já funciona.

## O que o projeto usa hoje

| Peça | Onde |
|------|------|
| Frontend + SSR | TanStack Start + Vite |
| Deploy (build) | Nitro preset **`vercel`** (`vite.config.ts`) |
| Banco / auth / storage | Supabase (variáveis de ambiente) |
| Assets estáticos | `public/` (badges, molduras, etc.) |

## Referências Lovable ainda no repo

| Item | Status | Ação |
|------|--------|------|
| `@lovable.dev/vite-tanstack-config` | **Mantido** | Wrapper Vite; já aponta Nitro → Vercel. Migrar para Vite “puro” é opcional e maior. |
| `@lovable.dev/cloud-auth-js` | **Removido** | OAuth Lovable não era usado; login é Supabase email/senha. |
| Meta tags / og:image Lovable | **Atualizado** | Branding Biosy em `__root.tsx`. |
| `.wrangler/` / Cloudflare | **Ignorado no git** | Resíduo do deploy Lovable; Vercel não usa. |

## Passo a passo na Vercel

### 1. Repositório Git

1. Crie um repo no GitHub/GitLab/Bitbucket.
2. Envie o código (`git push`).
3. **Não commite** `.env` (só `.env.example`).

### 2. Novo projeto na Vercel

1. [vercel.com/new](https://vercel.com/new) → importe o repo.
2. **Framework Preset:** Other (ou deixe auto-detectar Nitro).
3. **Node.js Version:** **22.x** (Project Settings → General → Node.js Version). O projeto exige Node ≥ 22.12.
4. **Build Command:** `npm run build` (já em `vercel.json`).
5. **Output Directory:** deixe em branco — o Nitro gera `.vercel/output` automaticamente.

### 3. Variáveis de ambiente

Em **Project → Settings → Environment Variables**, adicione:

| Variável | Onde usar | Obrigatória |
|----------|-----------|-------------|
| `VITE_SUPABASE_URL` | Cliente (browser) | Sim |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente | Sim |
| `SUPABASE_URL` | SSR / server | Sim |
| `SUPABASE_PUBLISHABLE_KEY` | SSR | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Apenas server (admin) | Se usar server functions admin |

Copie os valores do `.env` local ou do dashboard Supabase → **Settings → API**.

> **Importante:** marque `SUPABASE_SERVICE_ROLE_KEY` só para **Production** (e Preview se precisar), nunca exponha no client.

### 4. Supabase — URLs de auth

No Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://seu-dominio.vercel.app`
- **Redirect URLs:** inclua  
  `https://seu-dominio.vercel.app/**`  
  `http://localhost:5173/**` (dev)

### 5. Storage (música, avatars, etc.)

Bucket `profile-assets` já usa signed URLs do Supabase — funciona em qualquer domínio. Nada extra na Vercel.

### 6. Deploy

1. Clique **Deploy**.
2. O script `prebuild` roda `badges:sync` e `molduras:sync` antes do build.
3. Confira logs: build deve terminar com preset Vercel/Nitro.

### 7. Domínio customizado (opcional)

Vercel → **Domains** → adicione seu domínio e atualize de novo as URLs no Supabase.

## Testar build local (como na Vercel)

```bash
npm run build
```

Com preset Vercel, a saída fica em `.vercel/output` (gitignored). Para preview local do output Nitro:

```bash
npx vercel dev
```

(Requires Vercel CLI: `npm i -g vercel`)

## Checklist pós-deploy

- [ ] Home e perfil público (`/@username`) carregam
- [ ] Login / cadastro em `/auth`
- [ ] Dashboard após login
- [ ] Upload de mídia e música
- [ ] Molduras e badges (arquivos em `public/molduras`, `public/badges`)
- [ ] Player de música e cards hotel/discord

## Problemas comuns

**Build falha por variável Supabase**  
→ Confira se `VITE_*` e `SUPABASE_*` estão definidas na Vercel.

**Auth redireciona errado**  
→ Ajuste Site URL e Redirect URLs no Supabase.

**Molduras 404**  
→ Garanta que `src/assets/molduras` (fonte) ou `public/molduras` (sync) estão no Git; `prebuild` regenera o manifest.

**Ainda builda para Cloudflare**  
→ Confirme `nitro: { preset: "vercel" }` em `vite.config.ts` e que não está rodando dentro do sandbox Lovable (lá força Cloudflare).
