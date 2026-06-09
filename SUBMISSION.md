# Checklist de submissão — Presenciei

Lista prática do que precisa estar pronto antes do upload na App Store
Connect e no Google Play Console.

> **URLs em produção:**
> - Landing: <https://matheusrcd.github.io/onsite-tracker/>
> - Política de privacidade: <https://matheusrcd.github.io/onsite-tracker/privacy.html>
> - Suporte: <https://github.com/matheusrcd/onsite-tracker/issues>

---

## 🚀 Submissão em 10 minutos (App Store, via EAS)

Pra primeira submissão, esse é o caminho mais curto. Cada passo aqui
roda um comando ou um clique.

### 0. Pré-requisitos (uma vez)
- Apple Developer Program ativo (US$ 99/ano — enrole em
  <https://developer.apple.com/enroll/>)
- `npm install -g eas-cli`
- `eas login` (cria/usa a conta Expo)

### 1. Build de produção
```bash
eas build --platform ios --profile production
```
- Na primeira execução o EAS pergunta seu Apple ID e Team — login,
  ele cria cert + provisioning profile automaticamente
- Build roda na infra do EAS (~10-15 min), você pode fechar o terminal
- Quando terminar o link do `.ipa` aparece no terminal e em
  <https://expo.dev/accounts/matheusrcd/projects/presenciei/builds>

### 2. Criar o app no App Store Connect (3 min)
- <https://appstoreconnect.apple.com> → My Apps → `+` → New App
- Platform: iOS
- Name: **Presenciei**
- Primary language: Portuguese (Brazil)
- Bundle ID: escolha **com.matheusrcd.presenciei** (deve aparecer na
  lista após o primeiro `eas build` registrar no Developer Portal)
- SKU: `presenciei` (qualquer string única sua)
- User Access: Full Access

### 3. Submit via EAS
```bash
eas submit --platform ios --latest
```
- Pede Apple ID + senha de app (gera em
  <https://appleid.apple.com/account/manage> → Senhas específicas
  de app)
- Pede o ASC App ID — pega na URL do app criado no passo 2
- Upload de ~5 min, depois processamento da Apple (~30 min até
  aparecer em TestFlight)

### 4. Preencher metadados no ASC (10 min)
Tudo o que precisa colar tá pronto em `STORE.md`:

- **Nome / Subtítulo / Descrição / Keywords**: copia de `STORE.md`
- **Categoria**: Produtividade / Estilo de Vida
- **Idade**: 4+
- **Privacy Policy URL**: `https://matheusrcd.github.io/onsite-tracker/privacy.html`
- **Support URL**: `https://github.com/matheusrcd/onsite-tracker/issues`
- **App Privacy** (questionário): marcar **"Data Not Collected"** —
  literalmente isso é nossa situação
- **Capturas de tela** (5 sugestões em `STORE.md` → "Capturas de tela"):
  abra o app no iPhone 13/15 Pro Max e use o Screenshot do iOS (volume+power),
  faz 5 telas (Hoje, Setup com 3 escritórios, Histórico, Metas, Adicionar)
- **Encryption**: já configurado (`usesNonExemptEncryption: false`),
  pula a pergunta sem fricção
- **App Review Information**:
  - Notes for review: copia o bloco abaixo
  - Demo account: não precisa (sem login)

### 5. Notes for review (cola no campo do ASC)
```
Presenciei é um app de auto-registro de presença para trabalhadores
híbridos. O usuário cadastra 1 a 3 locais de trabalho usando a
localização do próprio aparelho, e o app conta cada dia que ele entra
nesses locais.

Implementação:
- Background location é usado via region monitoring nativo
  (CLCircularRegion / startGeofencingAsync), NÃO via streaming
  contínuo de localização. O sistema acorda o app apenas no enter
  event.
- Antes de pedir "Always Location", o app mostra uma tela explicando
  o uso e pedindo consentimento explícito.
- Nenhum dado de localização ou de uso sai do dispositivo. Não há
  backend, analytics, SDK publicitário ou autenticação.
- O usuário pode desligar o background tracking a qualquer momento
  pelo toggle na tela inicial.
- Sem permissão de background, o app degrada para check-in manual.
```

### 6. Submit for Review (1 clique)
- Sob "1.0 Prepare for Submission" → Add for Review → Submit for Review
- Review costuma sair em 24-48h

### Pós-aprovação
- Definir release manual ou automático
- Apple notifica por email; app fica live em algumas horas

---

## 1. Pré-requisitos de conta

- [ ] Apple Developer Program ativo (US$ 99/ano)
- [ ] Conta Google Play Developer paga (US$ 25, taxa única)
- [ ] Conta Expo (`npx expo login`) e organização (opcional, gratuita)
- [ ] EAS CLI instalado: `npm install -g eas-cli`

## 2. Identidade do app (uma vez)

- [ ] No App Store Connect: criar app **Presenciei**, Bundle ID
      `com.presenciei.app` (precisa estar registrado em "Identifiers"
      no developer portal antes)
- [ ] No Google Play Console: criar app **Presenciei**, package name
      `com.presenciei.app`
- [ ] Em `app.json`: trocar `owner` pelo seu usuário Expo e rodar
      `npx eas init` para gerar o `projectId` e gravá-lo em
      `extra.eas.projectId`
- [ ] Em `eas.json`: preencher `appleId`, `ascAppId`, `appleTeamId`
- [ ] (Android) Baixar o JSON da Service Account do Play Console e
      salvar como `play-service-account.json` na raiz (já está no
      `.gitignore`)

> ⚠️ **Se você não é dono do domínio "presenciei.com",** troque o
> bundle ID/package para algo no seu próprio namespace (ex.
> `me.seunome.presenciei`) **antes do primeiro build** — depois de
> publicado, mudar identifier exige novo app nas lojas.

## 3. Assets

- [ ] Rodar `npm run assets` (regenera PNGs a partir das SVGs)
- [ ] Verificar que `assets/icon.png` é 1024×1024 sem canal alfa
- [ ] Capturas de tela para todas as classes de dispositivo
      (veja STORE.md → "Capturas de tela")
- [ ] Imagem de destaque do Play Store (1024×500) — opcional mas
      recomendada; pode ser gerada com o mesmo SVG sobre um fundo
      orange/blue

## 4. Listagem das lojas

- [ ] Copiar de `STORE.md`: nome, subtítulo, descrição completa,
      keywords, "what's new"
- [ ] Hospedar `PRIVACY.md` em uma URL pública (GitHub Pages, Notion,
      qualquer landing) e colocar essa URL nas duas lojas
- [ ] URL de suporte (pode ser um GitHub Issues)
- [ ] Classificação etária 4+ / Livre
- [ ] App Store: declarar **não usa criptografia além do que vem do
      sistema** (já configurado em `ios.config.usesNonExemptEncryption: false`)

## 5. Privacidade (App Store "Nutrition Label" e Play "Data Safety")

Ver `STORE.md` → "Permissões — declaração nas lojas". Em ambos
os formulários, marcar:

- Não coletamos nenhum tipo de dado
- Dados de localização são processados no dispositivo e **não saem dele**
- Nenhum compartilhamento com terceiros

## 6. Build

```bash
# Login
npx expo login
eas login

# Configurar projeto (gera projectId)
eas init

# Build de produção
npm run build:ios       # gera .ipa
npm run build:android   # gera .aab
```

## 7. Submissão

```bash
# Após o build ficar pronto:
npm run submit:ios       # upload para App Store Connect
npm run submit:android   # upload para Play Console (track interno)
```

Depois do upload:

- **App Store:** preencher metadados em App Store Connect, anexar
  capturas, escolher build, submeter para review. Review costuma
  responder em 24–48h. Atenção especial à justificativa de **"Always"
  location** — eles vão pedir explicação.
- **Google Play:** começar com **Closed testing → Internal testing**,
  preencher Data Safety form, publicar capturas, depois promover para
  Production. A primeira submissão pode levar dias para review.

## 8. Pontos sensíveis durante review

### App Store
- **Background location**: é o item que mais reprova apps, mas o
  Presenciei usa **region monitoring (geofencing)** em vez de
  streaming contínuo de localização — é a primitiva que a Apple
  *prefere* pra esse caso de uso ("acordar ao chegar em um local
  conhecido"). Bateria praticamente zero e intenção bem definida.
  Na descrição e no campo "Review notes", deixe claro:
  1. O usuário cadastra explicitamente cada local (até 3).
  2. Os locais viram `CLCircularRegion` no iOS; nada de dados sai
     do dispositivo.
  3. O usuário pode desligar a qualquer momento pelo toggle
     "Rastreamento em segundo plano" na tela inicial.
  4. Sem permissão de background, o app degrada graciosamente para
     check-in manual.
  Inclua um vídeo curto mostrando o fluxo se possível.

### Google Play
- **Prominent Disclosure**: implementado em
  `src/screens/TodayScreen.tsx` — antes de chamar
  `requestBackgroundPermissionsAsync`, mostramos um Alert com o
  texto exigido pelo Google ("usaremos sua localização inclusive
  quando o app estiver fechado, apenas para detectar chegada nos
  escritórios cadastrados, nada sai do dispositivo, você pode
  desativar a qualquer momento") com os botões "Agora não" /
  "Permitir". Só seguimos pra permissão do sistema se o usuário
  optar por "Permitir".
- **Foreground service**: não usamos. Geofencing via Play Services
  cuida disso sem serviço em primeiro plano, então o app não pede
  `FOREGROUND_SERVICE`/`FOREGROUND_SERVICE_LOCATION`. Menor surface
  de permissões = review mais tranquilo.
- O **Data Safety** form precisa estar exatamente alinhado ao que o
  app faz. Como não coletamos nada, marque tudo como "Not collected".

## 9. Pós-lançamento

- [ ] Configurar canais de release no Play Console (interno → fechado
      → aberto → produção)
- [ ] Crash reporting: como não embutimos analytics, considere ativar
      apenas o crash report nativo do iOS e do Play Console (eles
      são opt-in do usuário e não dependem do app instrumentar).
- [ ] Pipeline de OTA com `eas update` (opcional)

## 10. Atualizações futuras

```bash
# Subir versão
# app.json: version + ios.buildNumber + android.versionCode
# Build + submit como antes.

# OU OTA-only (apenas mudanças JS):
eas update --channel production
```
