# Widgets Gigalink — Atualizações

Repositório **só de instruções de atualização** pro widget de desktop
"Resumo semanal" (não contém o código do app). Existe pra qualquer Claude
Code rodando numa máquina com uma cópia customizada do widget conseguir
puxar e aplicar as mudanças mais recentes, sem precisar copiar/colar
conteúdo manualmente numa conversa.

## Como funciona

1. O widget consulta a API de produção a cada 60s (endpoint
   `widget/faturamento-semanal`, entre outros). Um dos campos que essa
   API devolve é `versao_atual` (ex.: `"2026-07-22.1"`).
2. O widget compara esse valor com uma constante local (`APP_VERSION`, no
   topo do `widget.html`). Se forem diferentes, acende um indicador
   visual discreto (bolinha laranja perto do botão de refresh) — isso
   avisa que existe uma atualização disponível.
3. Quando isso acontecer (ou quando alguém simplesmente pedir "atualiza
   meu widget"), o Claude Code rodando naquela máquina deve:
   - Dar `git pull` (ou clonar, na primeira vez) neste repositório.
   - Abrir `VERSAO_MAIS_RECENTE.md` pra saber qual é o arquivo de
     atualização mais novo em `atualizacoes/`.
   - Ler esse arquivo e aplicar as mudanças descritas no `widget.html`
     (e, se o arquivo mencionar, em `main.js`/`preload.js`) **da máquina
     local** — seguindo à risca a regra de não sobrescrever
     customizações locais (cada arquivo de atualização já vem escrito
     nesse formato: descreve a intenção/formato de dado, não manda copiar
     um arquivo inteiro por cima).
   - Depois de aplicar, atualizar a constante `APP_VERSION` local pra
     bater com a versão aplicada — isso apaga o indicador de atualização
     no widget.

## Estrutura

```
README.md                    <- este arquivo
VERSAO_MAIS_RECENTE.md       <- só a versão + nome do arquivo mais novo
atualizacoes/
  2026-07-22.1_esteira-churn-vendas-401.md
  (futuras versões entram aqui, uma por arquivo, nunca sobrescrever uma antiga)
```

## Regra importante pra quem for gerar uma atualização nova

- Nunca sobrescrever um arquivo de `atualizacoes/` já publicado — cada
  versão é um arquivo novo (histórico completo fica preservado).
- Sempre atualizar `VERSAO_MAIS_RECENTE.md` apontando pro arquivo novo.
- Sempre bumpar o valor de `versao_atual` na API de produção (n8n) pra
  bater com o nome do arquivo novo, senão o indicador no widget nunca
  acende.
- Cada arquivo de atualização deve ser autocontido — descrever apenas as
  mudanças daquela versão específica, com o mesmo cuidado de sempre:
  intenção/formato de dado, nunca "copie este arquivo por cima do seu".
