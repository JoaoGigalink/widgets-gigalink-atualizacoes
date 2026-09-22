const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("widgetAPI", {
  close: () => ipcRenderer.send("widget-close"),
  getServerConfig: () => ipcRenderer.invoke("get-server-config"),
  tentarLogin: (usuario, senha) => ipcRenderer.invoke("tentar-login", { usuario, senha }),
  solicitarSenhaNova: (usuario) => ipcRenderer.invoke("solicitar-senha-nova", { usuario }),
  trocarSenha: (senhaNova) => ipcRenderer.invoke("trocar-senha-forcada", { senhaNova }),
  abrirTrocarSenha: () => ipcRenderer.invoke("abrir-trocar-senha"),
  abrirConfigVendedores: () => ipcRenderer.invoke("abrir-config-vendedores"),
  sessaoExpirada: () => ipcRenderer.invoke("sessao-expirada"),
  verificarAtualizacao: () => ipcRenderer.invoke("verificar-atualizacao"),
  instalarAtualizacao: () => ipcRenderer.invoke("instalar-atualizacao"),
  onAtualizacaoPronta: (callback) => {
    ipcRenderer.on("update-pronta", (event, info) => callback(info));
  },
});
