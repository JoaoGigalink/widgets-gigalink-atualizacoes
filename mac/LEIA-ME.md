# Widget Gigalink — instalação (Mac)

## O que é
Um card flutuante na área de trabalho com os números da semana (faturamento,
ativações vs. churn, vendas por vendedor). Atualiza sozinho a cada 60s.

## Como instalar (Mac)
O `.dmg` só pode ser gerado rodando num Mac de verdade (não existe
cross-compile do Windows), por isso esta pasta traz o código-fonte em vez
de um instalador pronto:

1. Abrir o Claude Code neste Mac, apontando pra esta pasta.
2. Pedir pra ele seguir o arquivo `INSTRUCOES_CLAUDE_CODE_MAC.md` (também
   nesta pasta) — ele instala as dependências, gera o `.dmg` e te guia na
   instalação.
3. Depois de instalado, na primeira abertura o app pede login — usar seu
   usuário e senha. Se a senha for temporária, o app vai pedir pra trocar
   antes de mostrar os widgets — normal, só seguir o passo.

## Sobre atualizações futuras
No Windows o app se atualiza sozinho (a partir da versão 0.2.0). No Mac,
como o app não é assinado com certificado Apple Developer, o auto-update
pode não funcionar de verdade — pode ser necessário repetir os passos
acima com uma cópia atualizada de `widget-gigalink-fonte/` quando sair
uma versão nova. Ver `INSTRUCOES_CLAUDE_CODE_MAC.md` para detalhes.

## Novidades recentes
- Botão de engrenagem (⚙) no card, visível só pro diretor — escolhe quais
  vendedores aparecem no gráfico "Vendas por Vendedor" e a cor de cada um,
  direto no widget, sem precisar pedir atualização.
- Ícone de conta conectada (mostra o usuário logado ao passar o mouse).
- Botão de logout, pra trocar de conta sem precisar editar arquivos.

## Se algo der errado
Ver o arquivo `INSTALACAO.md` nesta mesma pasta, seção "Troubleshooting" —
ou chamar o Joao.
