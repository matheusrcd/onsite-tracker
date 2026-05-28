# Política de Privacidade — Presenciei

**Última atualização:** 27 de maio de 2026

## TL;DR

O **Presenciei** não coleta, não transmite e não armazena seus dados em
nenhum servidor. Tudo o que você cadastra fica **somente no seu
dispositivo**. Não há login, não há analytics, não há anúncios, não há
compartilhamento com terceiros.

## Quem somos

O Presenciei é mantido por **\[Seu Nome / sua empresa]**. Para dúvidas
sobre esta política, escreva para **\[email@example.com]**.

## Dados que o app processa

| Dado | Onde fica | Para quê |
| --- | --- | --- |
| Localização (latitude/longitude) | Apenas no dispositivo (memória) | Calcular a distância até os locais cadastrados |
| Locais cadastrados (até 3) | AsyncStorage no dispositivo | Saber quais lugares contam como "presença" |
| Histórico de check-ins | AsyncStorage no dispositivo | Mostrar seu progresso |
| Metas semanal/mensal | AsyncStorage no dispositivo | Comparar com sua presença |

**Nada disso é enviado para fora do seu aparelho.** Não usamos servidores
de backend, não usamos serviços de analytics (sem Firebase, sem Mixpanel,
sem Sentry), não usamos SDKs publicitários.

## Localização em segundo plano

Para que o app conte automaticamente um dia presencial, o sistema
operacional fornece atualizações de localização periódicas para o
Presenciei mesmo quando o app não está aberto. Cada atualização é
comparada localmente aos locais cadastrados e descartada em seguida.
Você pode desligar o rastreamento em segundo plano a qualquer momento
pelo botão **"Rastreamento em segundo plano"** na tela inicial, ou
revogando a permissão em Ajustes do sistema.

## Permissões solicitadas

- **Localização — "Sempre"** (background): necessária para detectar
  automaticamente sua chegada aos locais cadastrados. Sem esta
  permissão, o check-in automático não funciona; o check-in manual
  continua funcionando com a permissão "Durante o uso do app".
- **Serviço em primeiro plano (Android)**: usado para manter o
  rastreamento ativo de forma transparente, com uma notificação
  persistente conforme exigido pelo Android.

## Compartilhamento com terceiros

Nenhum. O Presenciei não compartilha, vende ou aluga dados a ninguém,
porque não temos esses dados — eles nunca saem do seu telefone.

## Crianças

O app não é direcionado a crianças menores de 13 anos. Não coletamos
intencionalmente dados de crianças.

## Direitos do titular (LGPD / GDPR)

Como nenhum dado é coletado por nós, não há base de dados externa para
solicitar acesso, exportação ou exclusão. Para apagar tudo que o app
guarda, basta desinstalar o Presenciei ou usar **"Apagar conteúdo e
ajustes"** no Ajustes do sistema → Armazenamento → Presenciei.

## Mudanças nesta política

Caso a política mude, atualizaremos a data acima e divulgaremos na
mesma URL.

## Como contatar

\[email@example.com]
