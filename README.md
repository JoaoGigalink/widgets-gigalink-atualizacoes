# Widgets Gigalink — Atualizações

Repositório de distribuição do widget de desktop "Resumo semanal" da
Gigalink — guias de instalação por sistema operacional (`windows/`,
`mac/`) e os instaladores publicados nas
[Releases](https://github.com/JoaoGigalink/widgets-gigalink-atualizacoes/releases).

## Como funciona hoje (a partir da versão 0.2.0)

- **Windows**: o app tem atualização automática de verdade
  (`electron-updater`). Ele confere periodicamente se há uma versão nova
  publicada nas Releases deste repositório, baixa em background, e avisa
  (bolinha perto do botão de atualizar no widget) — clicar confirma a
  instalação e reinicia o app sozinho. Instalar uma vez (ver
  `windows/LEIA-ME.md`) é suficiente; não é preciso voltar aqui a cada
  atualização.
- **Mac**: o app **não é assinado** com certificado Apple Developer (uso
  interno, sem essa conta contratada), e o mecanismo de auto-update do
  Electron no macOS normalmente exige assinatura pra funcionar de
  verdade. Por isso, no Mac pode ser necessário reinstalar manualmente a
  cada atualização — ver `mac/LEIA-ME.md` e `mac/INSTRUCOES_CLAUDE_CODE_MAC.md`.

## Estrutura

```
README.md                          <- este arquivo
windows/
  LEIA-ME.md                       <- guia de instalação simples
  INSTALACAO.md                    <- guia técnico completo (troubleshooting)
mac/
  LEIA-ME.md                       <- guia de instalação simples
  INSTALACAO.md                    <- guia técnico completo (troubleshooting)
  INSTRUCOES_CLAUDE_CODE_MAC.md    <- passo a passo pro Claude Code gerar o .dmg
  widget-gigalink-fonte/           <- código-fonte necessário pra build no Mac
                                       (sem node_modules/dist — npm install resolve)
```

Os instaladores (`.exe`/`.dmg`) **não ficam commitados neste repositório**
— só nas [Releases](https://github.com/JoaoGigalink/widgets-gigalink-atualizacoes/releases),
pra não inflar o histórico git com binários grandes a cada versão.

## Publicando uma versão nova

No projeto principal (`w2_widget_corporativo`, fora deste repositório):

1. Fazer as mudanças, bumpar `version` em `package.json`.
2. `npm run dist:publish` — gera o instalador Windows e publica
   automaticamente nas Releases deste repositório (usa `electron-builder`
   com `publish: github` já configurado).
3. Conferir que o release saiu como publicado, não como rascunho
   (`gh release view vX.X.X --repo JoaoGigalink/widgets-gigalink-atualizacoes`
   — `draft` precisa ser `false`, senão o auto-update não o enxerga).
4. Atualizar `mac/widget-gigalink-fonte/` neste repositório com os
   arquivos que mudaram (main.js, preload.js, HTMLs, `widgets/`,
   `package.json`), já que o Mac não recebe a atualização automaticamente.
5. Se o Mac do diretor precisar da versão nova, seguir
   `mac/INSTRUCOES_CLAUDE_CODE_MAC.md` pra gerar e reinstalar o `.dmg`.

## Sistema anterior (obsoleto)

Antes da versão 0.2.0, este repositório guardava arquivos de instrução em
texto (pasta `atualizacoes/`) que um Claude Code rodando em cada máquina
lia e aplicava manualmente no código local. Esse mecanismo foi substituído
pelo auto-update real descrito acima. O histórico git ainda preserva o
conteúdo antigo, se precisar consultar.
