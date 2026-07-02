# Listagem nas lojas — App Store & Google Play

Texto pronto para colar no App Store Connect e no Google Play Console.

---

## Nome

- App Store / Play Store: **Presenciei**
- Subtítulo (App Store, 30 caracteres): **Conte seus dias no escritório**
- Frase curta (Google Play, 80 caracteres): **Marque automaticamente seus dias presenciais — meta semanal e mensal.**

## Categoria

- App Store: **Produtividade** (primária) · **Estilo de Vida** (secundária)
- Google Play: **Produtividade**

## Classificação etária

- 4+ (App Store) / Livre (Google Play). Não há conteúdo sensível, login social, conteúdo gerado por usuário, anúncios nem compras.

## Idiomas

- Português (Brasil) — primário
- Inglês — opcional (basta traduzir as strings da listagem; o app já está em pt-BR)

## Palavras-chave (App Store, 100 caracteres no total)

```
escritório,presença,hibrido,trabalho,checkin,produtividade,meta,assiduidade,home office,onsite
```

## Descrição curta (App Store: até 170 caracteres na "promotional text")

> Conte seus dias no escritório automaticamente. Cadastre até 3 locais,
> defina sua meta e acompanhe sua presença na semana e no mês.

## Descrição completa (pt-BR)

```
Presenciei é o app simples e elegante para quem trabalha em modelo híbrido.

• Cadastre até 3 locais (escritório principal, filial, casa do cliente…)
• Check-in automático em segundo plano — assim que você chega no local,
  o dia é contabilizado, sem precisar abrir o app.
• Botão de check-in manual sempre que quiser confirmar pelo aplicativo.
• Edite seu histórico: adicione um dia esquecido ou remova um registro
  com um toque.
• Defina uma meta semanal e/ou mensal e acompanhe se você bateu.
• Calendário com seus dias presenciais destacados.
• Tudo fica salvo no seu dispositivo — sem login, sem servidores,
  sem anúncios.

Como funciona:
1. Cadastre um ou mais locais de trabalho usando sua localização atual
   e um raio de detecção (100–200 m costuma funcionar para a maioria
   dos escritórios).
2. Ative o rastreamento em segundo plano. O app só precisa saber se
   você está dentro do raio — nada é enviado para fora do seu telefone.
3. Pronto. Acompanhe sua presença na aba "Hoje" e ajuste sua meta
   na aba "Metas".

Privacidade: o Presenciei não coleta, não envia e não armazena seus
dados em nenhum servidor. Sua localização é processada apenas no seu
dispositivo, e usada exclusivamente para detectar a chegada nos locais
que você cadastrou.
```

## Descrição completa (en-US, opcional)

```
Presenciei is the simple, well-designed companion for hybrid workers.

• Pin up to 3 work locations (HQ, branch, client's office…)
• Automatic background check-in — the moment you arrive within the
  detection radius, the day is logged. You don't need to open the app.
• Manual check-in button whenever you want to confirm in-app.
• Editable history: add a day you forgot, remove a bad record, all in
  a single tap.
• Set a weekly and/or monthly goal and watch your progress.
• Calendar view with onsite days highlighted.
• Everything stays on your device — no login, no servers, no ads.

Privacy: Presenciei does not collect, transmit, or store any of your
data on any server. Your location is processed exclusively on-device,
and used only to detect arrival at locations you've pinned yourself.
```

## What's new (1.0.0)

```
Primeira versão pública do Presenciei!
• Cadastro de até 3 locais de trabalho
• Check-in automático em segundo plano
• Metas semanais e mensais com progresso
• Histórico editável (adicione ou remova check-ins)
```

---

## Permissões — declaração nas lojas

### App Store (Privacy "Nutrition Label")

- **Location → Precise Location** · Linked to user? **No** · Used for tracking? **No**
- Propósito: *App functionality* (detectar chegada no local cadastrado pelo próprio usuário).
- Nenhum outro tipo de dado coletado.

### Google Play (Data Safety)

- Localização precisa: coletada **somente no dispositivo**, processada
  localmente, **não compartilhada**.
- Outros tipos: nenhum.

### Justificativa para `ACCESS_BACKGROUND_LOCATION` (Play Console)

```
Presenciei é um app de auto-registro de presença para trabalhadores
híbridos. A localização em segundo plano é necessária para a função
central do app: detectar automaticamente quando o usuário chega no
local de trabalho que ele próprio cadastrou, sem precisar abrir o
aplicativo. Nenhuma informação de localização é transmitida para fora
do dispositivo. O usuário pode desligar o rastreamento em segundo
plano a qualquer momento pelo botão "Rastreamento em segundo plano"
na tela inicial.
```

## Capturas de tela

Tudo o que você precisa subir já tá renderizado em `assets/screenshots/`:

```
assets/screenshots/
├── source/                  ← capturas originais do iPhone 13 (1170×2532)
├── iphone-6.7/              ← versões "puras" 1290×2796 (sem legenda)
├── iphone-6.5/              ← versões "puras" 1242×2688
├── promo-iphone-6.7/        ← com legenda em pt-BR (recomendado)
├── promo-iphone-6.5/        ← idem para 6.5"
├── promo-ipad-13/           ← iPad 13" 2064×2752 (exigido c/ supportsTablet)
└── promo-ipad-12.9/         ← iPad 12.9" 2048×2732 (legado, opcional)
```

**Use os `promo-iphone-6.7/` na submissão** — tem o headline +
subtítulo já compostos por cima, o que melhora a taxa de instalação
significativamente. As versões "puras" servem como fallback ou se a
Apple pedir captura sem marketing copy.

Tamanhos exigidos:

- **iPhone 6.7" / 6.9"** (iPhone 15/16 Pro Max): 1290×2796 — 3 a 10 imagens ✅
- **iPhone 6.5" (legado)**: 1242×2688 — opcional se já tiver 6.7" ✅
- **iPad 13"**: 2064×2752 — só se marcar "supportsTablet" (não usamos)
- **Android Phone**: 1080×1920 ou maior — mínimo 2, máximo 8
- **Android 7" Tablet / 10" Tablet**: opcional

Ordem sugerida pra App Store Connect:

1. `01-hoje.png` — _"Marque seus dias presenciais — Automaticamente, sem precisar abrir o app."_
2. `02-escritorios.png` — _"Até 3 locais de trabalho — Escritório, filial, casa do cliente."_
3. `03-metas.png` — _"Defina sua meta — Veja seu progresso na semana e no mês."_
4. `04-historico.png` — _"Tudo no calendário — Adicione ou remova qualquer dia."_

Pra atualizar legendas/imagens depois:

1. Substitua/adicione PNGs em `assets/screenshots/source/` (qualquer
   tamanho — o script preserva proporção)
2. Edite os captions em `scripts/prepare-promo-screenshots.mjs` (array
   `promos`)
3. `npm run screenshots && npm run promo` regenera tudo

## Ícone das lojas

- `assets/app-store-icon.png` (1024×1024, sem alpha) — App Store Connect
- `assets/play-store-icon.png` (512×512, sem alpha) — Google Play Console
- Ambos gerados a partir de `assets/source/icon.svg` (rode `npm run assets`).

## Suporte e marketing

- URL de suporte: <https://github.com/matheusrcd/onsite-tracker/issues>
- URL de marketing / landing: <https://matheusrcd.github.io/onsite-tracker/>
- URL da política de privacidade: <https://matheusrcd.github.io/onsite-tracker/privacy.html>
- URL do guia Android (setup em segundo plano): <https://matheusrcd.github.io/onsite-tracker/android.html>

(Tudo hospedado via GitHub Pages a partir de `docs/` no repo.)

### Play Store — trecho a incluir no final da descrição

```
📱 Está no Android? Antes de tudo, siga o guia rápido de 2 minutos em
https://matheusrcd.github.io/onsite-tracker/android.html
para desativar a otimização de bateria e o "autostart" do seu
fabricante — sem isso, o Android suspende o app em segundo plano.
```

## Account holder / Team

- Apple: precisa de Apple Developer Program ativo (US$ 99/ano)
- Google: Google Play Developer (US$ 25, taxa única)
