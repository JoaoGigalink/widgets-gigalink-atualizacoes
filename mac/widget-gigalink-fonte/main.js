const { app, BrowserWindow, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const fs = require("fs");
const path = require("path");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const WIDGETS_DIR = path.join(__dirname, "widgets");
const SERVER_CONFIG_PATH = process.env.WIDGETS_SERVER_CONFIG || path.join(__dirname, "config", "server.json");

function loadServerConfig() {
  return JSON.parse(fs.readFileSync(SERVER_CONFIG_PATH, "utf-8"));
}

function sessionPath() {
  return path.join(app.getPath("userData"), "session.json");
}

function loadSession() {
  try {
    return JSON.parse(fs.readFileSync(sessionPath(), "utf-8"));
  } catch {
    return null;
  }
}

function saveSession(session) {
  fs.writeFileSync(sessionPath(), JSON.stringify(session), "utf-8");
}

function clearSession() {
  try {
    fs.unlinkSync(sessionPath());
  } catch {
    // ja nao existia, tudo bem
  }
}

ipcMain.handle("get-server-config", () => {
  return loadSession() || loadServerConfig();
});

ipcMain.handle("tentar-login", async (event, { usuario, senha }) => {
  const cfg = loadServerConfig();
  try {
    const res = await fetch(`${cfg.baseUrl}/widget/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || `Erro ${res.status}` };
    }
    const data = await res.json();
    saveSession({
      baseUrl: cfg.baseUrl,
      widgetKey: data.chave,
      role: data.papel,
      usuario,
      precisaTrocarSenha: !!data.senha_temporaria,
    });
    if (loginWin) {
      loginWin.close();
      loginWin = null;
    }
    if (data.senha_temporaria) {
      openTrocarSenhaWindow();
    } else {
      startWidgets();
    }
    return { ok: true };
  } catch (e) {
    console.error("Erro no login, baseUrl =", cfg.baseUrl);
    console.error(e);
    if (e.cause) console.error("cause:", e.cause);
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("solicitar-senha-nova", async (event, { usuario }) => {
  const cfg = loadServerConfig();
  try {
    await fetch(`${cfg.baseUrl}/widget/solicitar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario }),
    });
  } catch {
    // best-effort; a tela ja mostra "solicitacao enviada" independente
  }
  return { ok: true };
});

ipcMain.handle("trocar-senha-forcada", async (event, { senhaNova }) => {
  const session = loadSession();
  try {
    const res = await fetch(`${session.baseUrl}/widget/trocar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-widget-key": session.widgetKey },
      body: JSON.stringify({ senha_nova: senhaNova }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.error || `Erro ${res.status}` };
    }
    const data = await res.json().catch(() => ({}));
    saveSession({
      ...session,
      widgetKey: data.chave || session.widgetKey,
      precisaTrocarSenha: false,
    });
    if (trocarSenhaWin) {
      trocarSenhaWin.close();
      trocarSenhaWin = null;
    }
    if (widgetsStarted) {
      reloadWidgets();
    } else {
      startWidgets();
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

function loadWidgetConfigs() {
  return fs
    .readdirSync(WIDGETS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(WIDGETS_DIR, entry.name);
      const configPath = path.join(dir, "config.json");
      if (!fs.existsSync(configPath)) return null;
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      return { ...config, dir };
    })
    .filter(Boolean);
}

function createWidgetWindow(config) {
  const win = new BrowserWindow({
    width: config.width || 320,
    height: config.height || 180,
    x: config.x,
    y: config.y,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: config.alwaysOnTop !== false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(config.dir, config.html));
  win.setAlwaysOnTop(config.alwaysOnTop !== false, "screen-saver");

  return win;
}

let widgetsStarted = false;
const widgetWindows = [];

function startWidgets() {
  if (widgetsStarted) return;
  const configs = loadWidgetConfigs();
  if (!configs.length) {
    console.log("Nenhum widget encontrado em widgets/.");
  }
  configs.forEach((config) => widgetWindows.push(createWidgetWindow(config)));
  widgetsStarted = true;
}

function reloadWidgets() {
  widgetWindows.forEach((win) => {
    if (!win.isDestroyed()) win.webContents.reload();
  });
}

function handleSessionExpired() {
  clearSession();
  widgetWindows.forEach((win) => {
    if (!win.isDestroyed()) win.close();
  });
  widgetWindows.length = 0;
  widgetsStarted = false;
  if (trocarSenhaWin && !trocarSenhaWin.isDestroyed()) {
    trocarSenhaWin.close();
    trocarSenhaWin = null;
  }
  if (!loginWin) {
    openLoginWindow();
  }
}

let loginWin = null;
let trocarSenhaWin = null;
let configVendedoresWin = null;

function openLoginWindow() {
  loginWin = new BrowserWindow({
    width: 320,
    height: 360,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  loginWin.loadFile(path.join(__dirname, "login.html"));
}

function openTrocarSenhaWindow({ forced = true } = {}) {
  if (trocarSenhaWin) {
    trocarSenhaWin.focus();
    return;
  }
  trocarSenhaWin = new BrowserWindow({
    width: 320,
    height: 360,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  trocarSenhaWin.on("closed", () => {
    trocarSenhaWin = null;
  });
  trocarSenhaWin.loadFile(path.join(__dirname, "trocar-senha.html"), {
    query: { forced: forced ? "1" : "0" },
  });
}

function openConfigVendedoresWindow() {
  if (configVendedoresWin) {
    configVendedoresWin.focus();
    return;
  }
  configVendedoresWin = new BrowserWindow({
    width: 360,
    height: 480,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
  configVendedoresWin.on("closed", () => {
    configVendedoresWin = null;
  });
  configVendedoresWin.loadFile(path.join(__dirname, "config-vendedores.html"));
}

ipcMain.on("widget-close", (event) => {
  const senderWin = BrowserWindow.fromWebContents(event.sender);
  if (senderWin) senderWin.close();
});

ipcMain.handle("abrir-trocar-senha", () => {
  openTrocarSenhaWindow({ forced: false });
  return { ok: true };
});

ipcMain.handle("abrir-config-vendedores", () => {
  openConfigVendedoresWindow();
  return { ok: true };
});

ipcMain.handle("sessao-expirada", () => {
  handleSessionExpired();
  return { ok: true };
});

let updateInfo = null;

function broadcastUpdateReady() {
  widgetWindows.forEach((win) => {
    if (!win.isDestroyed()) win.webContents.send("update-pronta", updateInfo);
  });
}

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on("update-downloaded", (info) => {
  updateInfo = { versao: info.version, notas: info.releaseNotes || "" };
  broadcastUpdateReady();
});

autoUpdater.on("error", (err) => {
  console.error("Erro ao checar/baixar atualização:", err);
});

ipcMain.handle("verificar-atualizacao", () => {
  return updateInfo;
});

ipcMain.handle("instalar-atualizacao", () => {
  autoUpdater.quitAndInstall();
  return { ok: true };
});

function bootstrap() {
  const session = loadSession();
  if (!session) {
    openLoginWindow();
  } else if (session.precisaTrocarSenha) {
    openTrocarSenhaWindow();
  } else {
    startWidgets();
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    app.setLoginItemSettings({ openAtLogin: true });
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("Erro ao checar atualização:", err);
    });
  }

  bootstrap();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      bootstrap();
    }
  });
});

app.on("window-all-closed", () => {
  widgetsStarted = false;
  if (process.platform !== "darwin") app.quit();
});
