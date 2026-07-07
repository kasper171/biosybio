# Prompt — ilustração cartoon do notebook Biosy (ChatGPT / DALL·E)

Use o texto abaixo no ChatGPT com geração de imagem (DALL·E). Gere **2 versões** se possível: uma com fundo transparente e outra com fundo escuro sólido.

---

## Prompt principal (copiar e colar)

```
Create a premium cartoon illustration for a SaaS landing page hero section.

Subject: a modern laptop (MacBook-style) floating slightly at a soft 3/4 angle, screen open and facing the viewer. The laptop should look sleek, professional, and slightly stylized — not photorealistic, but high-end product illustration (think Stripe, Linear, or Vercel marketing art).

Screen content (IMPORTANT — must match this layout):
- Dark dashboard UI (#0b0b0f background)
- Left sidebar with app name "Biosy" at top
- Navigation items: Painel, Métricas, Templates, Conta
- Second section "Estúdio" with: Perfil, Mídia, Áudio, Aparência, Efeitos, Colors, Redes
- Middle narrow tools panel titled "Perfil" with form fields (name, bio)
- Right area: live preview of a profile card (avatar circle, display name, @username, short bio, 3 social icons)
- Pink/magenta accent color (#ff2d7a, hot pink) on borders, glow, and highlights
- Subtle glassmorphism, soft shadows, rounded corners

Art style:
- Cartoon / stylized 3D or 2.5D illustration
- Clean vector-like edges with soft gradients
- Gentle ambient glow behind the laptop (pink and violet)
- Optional: minimal desk surface or abstract shapes — keep background simple
- NO cluttered details, NO readable tiny text beyond "Biosy"
- Professional, friendly, creator-platform vibe

Lighting:
- Soft studio lighting from top-left
- Pink rim light on laptop edges
- Screen emits subtle pink glow onto keyboard area

Background:
- Dark purple-black gradient (#0a0510 to #120818)
- OR transparent background (PNG) for web overlay
- Soft bokeh or abstract blobs in pink/violet (very subtle)

Composition:
- Laptop centered, occupying ~70% of frame
- Leave breathing room on sides for website layout
- Aspect ratio: 4:3 or 16:10 landscape
- High resolution, sharp screen UI, no watermark, no logo other than "Biosy"

Mood: innovative, creative, Brazilian creator economy, premium but approachable.
```

---

## Prompt alternativo (mais cartoon / mascote leve)

```
Stylized cartoon laptop hero illustration for "Biosy" — a link-in-bio platform for creators.

Cute-professional hybrid style: rounded shapes, soft shadows, not childish. Laptop character-like presence but still a real product mockup.

Screen shows dark-mode dashboard: left nav sidebar, center editing panel "Perfil", right side profile card preview with pink glow.

Color palette: black, deep plum, hot pink (#ff2d7a), white text.

Floating laptop with soft pink aura, minimal stars or sparkles (subtle).

Background: dark gradient with transparent PNG option.

16:10 landscape, marketing-quality, SaaS website hero asset.
```

---

## Como usar no projeto

1. Gere a imagem no ChatGPT.
2. Baixe em **PNG** (preferência: fundo transparente ou `#0a0510`).
3. Salve como: `public/home-laptop-scene.png`
4. A home detecta o arquivo e usa como fundo atrás do notebook CSS.

Tamanho recomendado: **1600×1200px** ou **1920×1200px**.

---

## O que evitar na imagem

- Texto ilegível ou Lorem Ipsum na tela
- Logos de marcas reais (Instagram, etc.) em tamanho grande
- Estilo infantil / clip-art anos 2000
- Laptop em perspectiva extrema (dificulta leitura do UI)
- Cores fora da paleta (azul corporativo, verde neon)
