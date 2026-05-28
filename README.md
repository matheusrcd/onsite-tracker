# Presenciei

> _"Eu estive lá."_ — um app simples e bonito para quem trabalha em
> modelo híbrido contar seus dias presenciais automaticamente.

- 📍 Cadastre até **3 locais** (escritório, filial, casa do cliente…)
- 🛰️ **Check-in automático** em segundo plano via geofence
- ✋ Check-in **manual** quando quiser
- 📅 **Histórico editável** — adicione ou remova qualquer dia
- 🎯 **Metas** semanais e mensais com progresso visual
- 🔒 **100% local** — nada sai do seu dispositivo
- 🎨 Identidade laranja / azul / branco (Itaú-inspired)

## Run

```bash
npm install
npm start          # Expo dev server
npm run ios        # iOS Simulator
npm run android    # Android device/emulator
```

> Background location requires a **development build** or a real device.
> Use `npx expo run:ios` / `npx expo run:android` once, then `npm start`
> reuses the dev client.

## Layout

```
App.tsx                       # tab navigator + Setup / AddVisit modals
src/
  theme.ts                    # cores, spacing, sombra
  storage.ts                  # AsyncStorage helpers, datas, multi-office
  geo.ts                      # Haversine
  tracking.ts                 # TaskManager + check-in manual
  ui/
    Card.tsx, Button.tsx
    ProgressRing.tsx          # gauge horizontal de meta
    Calendar.tsx              # grade do mês, com seleção opcional
    TabBar.tsx
  screens/
    TodayScreen.tsx           # status + check-in + meta da semana
    HistoryScreen.tsx         # calendário do mês + lista + botão "+"
    GoalsScreen.tsx           # steppers para meta semanal/mensal
    SetupScreen.tsx           # lista de até 3 escritórios + editor
    AddVisitScreen.tsx        # modal de check-in retroativo

assets/
  icon.png, splash-icon.png, favicon.png
  android-icon-{foreground,background,monochrome}.png
  app-store-icon.png, play-store-icon.png
  source/                     # SVGs mestre — editar aqui, depois `npm run assets`

scripts/
  generate-assets.mjs         # SVG → PNGs (sharp)

app.json                      # Expo config (bundleId/package/permissions)
eas.json                      # EAS build/submit profiles
STORE.md                      # texto pronto p/ App Store + Play Store
PRIVACY.md                    # política de privacidade
SUBMISSION.md                 # checklist de submissão
```

## Scripts

```bash
npm run assets        # regenera os PNGs de ícone a partir das SVGs
npm run typecheck     # tsc --noEmit
npm run doctor        # expo-doctor
npm run build:ios     # eas build --platform ios --profile production
npm run build:android # eas build --platform android --profile production
npm run submit:ios    # eas submit --platform ios --latest
npm run submit:android# eas submit --platform android --latest
```

## Identidade

- Laranja `#EC7000` · Azul `#003087` · Branco `#FFFFFF`
- Mark: pin de localização branco com check azul dentro
- Wordmark: **Presenc<span style="color:#EC7000">i</span>ei** (o "i"
  ganha um destaque sutil em laranja)

Para mexer no mark, edite `assets/source/*.svg` e rode `npm run assets`.

## Submissão nas lojas

Veja **[SUBMISSION.md](./SUBMISSION.md)** para o checklist completo,
**[STORE.md](./STORE.md)** para o texto da listagem em pt-BR/en e
**[PRIVACY.md](./PRIVACY.md)** para a política de privacidade (precisa
ser hospedada em URL pública antes da submissão).

### Configuração mínima antes do primeiro build

1. `app.json`:
   - `owner` → seu usuário Expo
   - `ios.bundleIdentifier` e `android.package` → seu namespace
     (ex. `me.seunome.presenciei`) se você não controla `presenciei.com`
2. `npx eas init` → grava o `projectId` em `app.json` → `extra.eas.projectId`
3. `eas.json`:
   - `submit.production.ios.appleId/ascAppId/appleTeamId`
4. Capturas de tela (5 sugeridas em `STORE.md`)
5. Política de privacidade publicada em URL acessível

## Como o tracking funciona

`src/tracking.ts` usa **region monitoring nativo** (`expo-location` →
`startGeofencingAsync`) e não streaming contínuo de localização. Cada
escritório cadastrado vira uma região circular registrada com o OS:

- **iOS**: mapeia para `CLCircularRegion`. O SO acorda o app no enter,
  o consumo de bateria é praticamente zero, e as regiões **persistem
  através de force-quit e reboot**. Limite de 20 regiões por app
  (usamos no máximo 3).
- **Android**: usa a Geofencing API do Google Play Services. Igual em
  comportamento, mas as regiões são **descartadas no reboot do
  dispositivo** — por isso o `App.tsx` chama `syncGeofences()` a cada
  refresh, re-registrando o conjunto atual de escritórios.

Quando o task dispara (`GeofencingEventType.Enter`), o handler:

1. Identifica qual escritório corresponde à `region.identifier`.
2. Registra um visit do dia (`recordVisitToday('auto', { officeName })`).

O usuário liga e desliga tudo isso pelo toggle "Rastreamento em
segundo plano" na tela inicial. O check-in manual (botão grande no
"Hoje") continua usando uma leitura única de localização +
distância Haversine — independente do geofence.

## Privacidade

Nada sai do dispositivo. AsyncStorage local, sem rede, sem analytics.

## Limitações conhecidas

- Não testado em hardware ainda — o geofence precisa de teste real
- Não há picker de mapa para cadastrar o local (pega só "minha
  localização atual"). Um próximo passo natural é integrar
  `react-native-maps`.
- Sem sync entre dispositivos.

## Licença

[MIT](./LICENSE)
