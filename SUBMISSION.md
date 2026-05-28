# Checklist de submissão — Presenciei

Lista prática do que precisa estar pronto antes do upload na App Store
Connect e no Google Play Console.

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
- **Background location**: é o item que mais reprova apps. Na
  descrição da app e no campo "Review notes", deixe claro que:
  1. O usuário cadastra explicitamente os locais.
  2. A localização nunca sai do dispositivo.
  3. O usuário pode desligar o tracking a qualquer momento.
  Inclua um vídeo curto mostrando o fluxo se possível.
- Garantir que o app **funciona** sem permissão de background
  (degradação para check-in manual) — o reviewer vai testar.

### Google Play
- O formulário de **"Prominent Disclosure"** para background location
  exige um diálogo no app explicando o uso *antes* de pedir a permissão.
  Atualmente o app pede direto via `requestBackgroundPermissionsAsync`;
  se o Play recusar, adicione um modal explicativo antes da chamada.
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
