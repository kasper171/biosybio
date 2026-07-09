# Módulo Álbum (Estilo Álbum)

Sistema isolado do **Card Normal**. Nenhum arquivo deste módulo importa componentes, hooks ou libs do Card Normal.

## Remoção segura

Para remover o Álbum sem afetar o Card Normal:

1. Apague `src/features/album/`
2. Apague `src/routes/_authenticated/dashboard.album.tsx`
3. Apague `src/routes/_authenticated/dashboard.estilo.tsx`
4. Reverta o glue em:
   - `src/routes/$username.tsx` (branch AlbumPublicView)
   - `src/components/dashboard/DashboardAccountLayout.tsx` (itens Estilo / Studio Álbum)
5. Rode migration down ou `DROP` das tabelas `profile_display_styles`, `album_layouts`, `album_connections` e bucket `album-media`
6. `npm uninstall react-grid-layout @types/react-grid-layout`

## Tabelas Supabase

- `profile_display_styles` — escolha card vs album
- `album_layouts` — layout jsonb + theme jsonb
- `album_connections` — Discord/Habbo/Habblet isolados
- Storage bucket `album-media`

## Segurança

- RLS por `user_id` em todas as tabelas
- Validação Zod server-side em `album-layout-schema.ts`
- Sanitização de texto em `album-sanitize.ts`
- URLs externas validadas em `album-url-validation.ts`
- Upload com whitelist MIME/tamanho/quota em `album-upload-validation.ts`
- OTP + rate limit em `album.functions.ts` e `album-connection-*`

## Rotas

- `/dashboard/estilo` — seletor Card Normal vs Álbum
- `/dashboard/album` — studio do editor
