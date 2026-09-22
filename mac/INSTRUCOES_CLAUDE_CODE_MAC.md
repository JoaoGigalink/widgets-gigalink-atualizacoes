# Instruções para o Claude Code (rodando neste Mac)

Você está rodando num Mac e recebeu esta pasta pra gerar e instalar o
"Widget Gigalink" — um app Electron de desktop. O `.dmg` só pode ser
gerado rodando num Mac de verdade (não existe cross-compile do Windows),
por isso esta pasta trouxe o código-fonte em vez de um instalador pronto.

## O que fazer, na ordem

1. **Confirmar Node.js instalado**: rodar `node -v`. Precisa de Node 18+.
   Se não tiver, instalar antes de continuar (ex.: `brew install node`,
   ou baixar de nodejs.org).

2. **Instalar dependências**, dentro da pasta `widget-gigalink-fonte/`
   desta mesma pasta:
   ```bash
   cd widget-gigalink-fonte
   npm install
   ```

3. **Conferir `config/server.json`** — já deve estar assim (produção):
   ```json
   { "baseUrl": "https://workflows.gigalink.net.br/webhook" }
   ```
   Se por algum motivo estiver diferente, corrigir para esse valor antes
   de prosseguir.

4. **Testar antes de empacotar (recomendado)**:
   ```bash
   npm start
   ```
   Deve abrir uma tela de login. Não precisa logar de verdade agora — só
   confirmar que a janela abre sem erro no terminal. Fechar com o botão
   "x" antes do próximo passo.

5. **Gerar o `.dmg`**:
   ```bash
   npm run dist
   ```
   Isso cria `dist/Widgets Gigalink-0.2.0.dmg` (ou nome parecido — o
   número da versão vem de `package.json`).

6. **Instalar**: abrir o `.dmg` gerado, arrastar o app pra pasta
   Applications (ou onde o diretor preferir), e abrir.

7. **Aviso esperado do Gatekeeper**: como este app não é assinado/
   notarizado pela Apple (é uso interno, sem conta Apple Developer), o
   macOS vai bloquear a primeira abertura com "não é possível abrir
   porque o desenvolvedor não pôde ser verificado". Pra liberar:
   - Clicar com o botão direito (ou Control+clique) no app → **Abrir**
   - Confirmar **Abrir** no diálogo que aparece.
   - Isso só é necessário na primeira execução.

8. **Login**: na primeira abertura, o app pede usuário/senha — o diretor
   já tem uma conta cadastrada (papel "diretor"). Se a senha for
   temporária, o app vai pedir pra trocar antes de mostrar os widgets —
   normal.

## O que NÃO fazer

- Não editar `main.js`, `preload.js` ou os arquivos em `widgets/` — o
  código já está pronto e testado no Windows; só precisa ser empacotado
  aqui.
- Não trocar `config/server.json` para um valor de localhost/desenvolvimento.
- Não tentar assinar/notarizar com um certificado Apple Developer sem
  perguntar antes — isso não foi contratado/decidido ainda (ver
  `INSTALACAO.md` nesta mesma pasta pra mais contexto).

## Se algo der errado

Ver a seção "Troubleshooting" em `INSTALACAO.md`, nesta mesma pasta —
cobre erros comuns de login, dados não aparecendo, etc. Se o erro for na
geração do `.dmg` em si (passo 5), o mais comum é falta de Xcode Command
Line Tools — rodar `xcode-select --install` e tentar `npm run dist` de
novo.

## Depois de gerar o `.dmg` uma vez

O app agora tem **atualização automática** (a partir da versão 0.2.0),
mas com uma ressalva importante no Mac:

- **No Windows**: funciona de ponta a ponta sem precisar de nada extra —
  o app confere, baixa e avisa quando sai versão nova (bolinha perto do
  botão de atualizar), e instala sozinho ao confirmar.
- **No Mac**: o mecanismo de auto-update do Electron (Squirrel.Mac)
  normalmente exige que o app seja **assinado com certificado Apple
  Developer** para funcionar de verdade — e este app não é assinado
  (decisão já tomada: sem custo de conta Apple Developer, uso interno).
  Ou seja, **no Mac pode ser necessário continuar gerando e reinstalando
  o `.dmg` manualmente** a cada atualização, repetindo os passos acima
  com uma pasta `widget-gigalink-fonte/` atualizada — pelo menos até essa
  decisão ser reavaliada.
