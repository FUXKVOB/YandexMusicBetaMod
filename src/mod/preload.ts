const { contextBridge, ipcRenderer, globalShortcut, BrowserWindow } = require("electron");

contextBridge.exposeInMainWorld("yandexMusicMod", {
  getStorageValue: (key: string) => ipcRenderer.invoke("yandexMusicMod.getStorageValue", key),
  setStorageValue: (key: string, value: unknown) => ipcRenderer.send("yandexMusicMod.setStorageValue", key, value),
  onStorageChanged: (cb: (key: string, value: unknown) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, key: string, value: unknown) => cb(key, value);
    ipcRenderer.on("yandexMusicMod.storageValueUpdated", listener);
    return () => ipcRenderer.removeListener("yandexMusicMod.storageValueUpdated", listener);
  },
  downloadTrack: (downloadInfo: DownloadInfo, trackMeta: TrackMeta, customDownloadPath?: string) =>
    ipcRenderer.invoke("yandexMusicMod.downloadTrack", downloadInfo, trackMeta, customDownloadPath),
  openDownloadDirectory: () => ipcRenderer.send("yandexMusicMod.openDownloadDirectory"),
  selectDownloadFolder: () => ipcRenderer.invoke("yandexMusicMod.selectDownloadFolder"),
  openFolder: (folderPath: string) => ipcRenderer.invoke("yandexMusicMod.openFolder", folderPath),
  axios: (config: Record<string, unknown>) => ipcRenderer.invoke("yandexMusicMod.axios", config),
});

globalShortcut.register("CommandOrControl+Shift+I", () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.toggleDevTools();
  }
});
