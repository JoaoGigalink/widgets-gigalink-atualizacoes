# Widgets Gigalink — Guia de Instalação

Este arquivo é um roteiro autossuficiente para instalar/gerar o app de widgets
de desktop da Gigalink numa máquina nova (Windows ou Mac). Se você é um Claude
Code rodando nesta máquina, siga os passos na ordem — cada um indica o que
checar antes de prosseguir.

## O que é este app

Um app Electron (sem instalação de servidor local necessária) que mostra um
card flutuante na área de trabalho, atualizado a cada 60s. Na primeira
execução, pede **login (usuário/senha)** — depois disso, mostra slides
diferentes conforme o papel da pessoa:
- **Diretor**: Faturamento semanal, Ativações vs Churn, Vendas por vendedor
  (com nomes).
- **Vendedor**: só um slide — a própria venda do dia comparada ao melhor do
  dia e à média (sem nomes de outros vendedores).

Os dados vêm de uma URL pública (hoje: `https://workflows.gigalink.net.br/webhook`,
um workflow n8n que consulta o MySQL de produção). O app **não roda nenhum
servidor local** — só consome essa API. Ver `SEGURANCA.md` pro modelo de
proteção completo (login, papéis, bloqueio por tentativas).

## Pré-requisitos

- Node.js LTS (18+) instalado (`node -v` pra confirmar).
- A pasta completa do projeto `Widgets-Gigalink` (com `node_modules` ou não —
  se não tiver, `npm install` resolve).
- O workflow n8n (`Widgets_Gigalink_Passthrough_Workflow.json`) já precisa
  estar ativo em produção, com pelo menos um usuário cadastrado no banco
  (ver `INSTRUCOES_Widgets_Gigalink_Workflow.txt` e `gerar_seed_usuarios.py`)
  — sem isso, ninguém consegue logar.

## Passo 1 — Instalar dependências

```bash
cd Widgets-Gigalink
npm install
```

## Passo 2 — Confirmar o servidor de dados

Abrir `config/server.json` e confirmar que está assim (produção):

```json
{
  "baseUrl": "https://workflows.gigalink.net.br/webhook"
}
```

Esse arquivo **não guarda mais nenhuma chave/senha** — é só a URL do
servidor, igual pra todo mundo. A autenticação de cada pessoa acontece via
tela de login na primeira execução do app (usuário/senha cadastrados no
banco), não aqui.

Se estiver apontando pra `http://127.0.0.1:5050` ou `http://localhost:5678`
(usados só durante desenvolvimento/teste local), TROCAR para o valor de
produção acima antes de gerar o instalador definitivo.

## Passo 3 — Testar antes de empacotar (opcional mas recomendado)

```bash
npm start
```

Deve abrir a tela de login. Entrar com um usuário/senha válido (peça pra
quem administra o banco, ou veja `gerar_seed_usuarios.py` pra criar um
novo). Se a senha for temporária, o app vai pedir pra trocar antes de abrir
os widgets — isso é esperado. Fechar pelo botão "x" do widget antes de
prosseguir.

## Passo 4 — Gerar o instalador

**IMPORTANTE:** o instalador tem que ser gerado NO MESMO sistema operacional
de destino — não dá pra gerar `.dmg` (Mac) rodando no Windows nem vice-versa.

```bash
npm run dist
```

- No Windows: gera `dist/Widgets Gigalink Setup 0.1.0.exe` (instalador NSIS,
  one-click, sem diálogo).
- No Mac: gera `dist/Widgets Gigalink-0.1.0.dmg`.

Como não existe mais chave embutida, **o mesmo instalador serve pra todo
mundo** — diretor e vendedor usam o mesmíssimo `.exe`, só o login que muda
o que aparece.

## Passo 5 — Instalar

Rodar o instalador gerado (o `.exe` ou o `.dmg`) na máquina final. Na
primeira abertura, a pessoa loga com o próprio usuário/senha. O app já vem
configurado para:

- Iniciar automaticamente junto com o login do usuário (`openAtLogin`).
- Não aparecer na barra de tarefas/dock (`skipTaskbar`).
- Ficar sempre visível por cima de outras janelas, a menos que
  `widgets/resumo-semanal/config.json` tenha `alwaysOnTop: false`.
- Pular a tela de login nas próximas vezes (sessão salva localmente em
  `%APPDATA%\Widgets Gigalink\session.json`).

Nenhum passo manual de "adicionar aos itens de login" é necessário.

**No Mac:** como o app não é assinado/notarizado pela Apple (uso interno,
sem conta Apple Developer), o macOS vai bloquear a primeira abertura com
"não é possível abrir porque o desenvolvedor não pôde ser verificado". Para
liberar: clicar com o botão direito no app → "Abrir" → confirmar "Abrir" no
diálogo. Só é necessário na primeira execução.

## Personalizar o widget (opcional)

Editar `widgets/resumo-semanal/config.json`:

```json
{
  "width": 380,
  "height": 230,
  "x": 40,
  "y": 40,
  "alwaysOnTop": true
}
```

`x`/`y` = posição na tela (canto superior esquerdo). `alwaysOnTop: false` faz
o widget se comportar como uma janela normal (fica atrás de outros apps).
Depois de editar, é preciso gerar o instalador de novo (`npm run dist`) e
reinstalar — a config é lida na hora que o app abre, e no pacote fica uma
cópia congelada da pasta `config/` e `widgets/` do momento do build.

## Troubleshooting

- **Login não passa / "Usuário ou senha inválidos"**: confirmar que o
  usuário existe e está ativo no banco (`widget_api_keys`, `ativo=1`). Ver
  `SEGURANCA.md` pra criar/checar usuários.
- **"Conta temporariamente bloqueada"**: 5 tentativas erradas seguidas
  bloqueiam por 15 minutos — esperar ou zerar `tentativas_falhas` e
  `bloqueado_ate` no banco pra esse usuário.
- **Slide mostra "Sem dados"**: a API não está respondendo, o workflow n8n
  está inativo, ou (no caso de Vendas) o scraper novo ainda não rodou em
  produção — não é problema do app Electron.
- **Slide mostra "Erro: Failed to fetch"**: sem internet, ou a URL em
  `config/server.json` está errada/desatualizada.
- **Widget não abre nenhuma janela**: rodar `npm start` num terminal pra ver
  o erro no console (o instalador final não mostra console nenhum).

## Onde está o resto da automação (contexto, não precisa mexer aqui)

- O workflow n8n que serve os dados (`Widgets_Gigalink_Passthrough_Workflow.json`),
  as instruções de deploy (`INSTRUCOES_Widgets_Gigalink_Workflow.txt`) e o
  modelo de segurança (`SEGURANCA.md`) ficam nesta mesma pasta — são
  independentes deste app e já devem estar ativos em produção (com pelo
  menos um usuário cadastrado) antes de distribuir o instalador.
