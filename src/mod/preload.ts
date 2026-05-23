declare const electron: {
  contextBridge: {
    exposeInMainWorld(key: string, api: Record<string, unknown>): void;
  };
  ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
    send(channel: string, ...args: unknown[]): void;
    on(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
    removeListener(channel: string, listener: (event: unknown, ...args: unknown[]) => void): void;
  };
  globalShortcut: {
    register(accelerator: string, callback: () => void): void;
  };
  BrowserWindow: {
    getFocusedWindow(): { webContents: { toggleDevTools(): void } } | null;
  };
};

electron.contextBridge.exposeInMainWorld("yandexMusicMod", {
  getStorageValue: (key: string) => electron.ipcRenderer.invoke("yandexMusicMod.getStorageValue", key),
  setStorageValue: (key: string, value: unknown) => electron.ipcRenderer.send("yandexMusicMod.setStorageValue", key, value),
  onStorageChanged: (cb: (key: string, value: unknown) => void) => {
    const listener = (_e: unknown, key: string, value: unknown) => cb(key, value);
    electron.ipcRenderer.on("yandexMusicMod.storageValueUpdated", listener);
    return () => electron.ipcRenderer.removeListener("yandexMusicMod.storageValueUpdated", listener);
  },
  downloadTrack: (downloadInfo: DownloadInfo, trackMeta: TrackMeta, customDownloadPath?: string) =>
    electron.ipcRenderer.invoke("yandexMusicMod.downloadTrack", downloadInfo, trackMeta, customDownloadPath),
  openDownloadDirectory: () => electron.ipcRenderer.send("yandexMusicMod.openDownloadDirectory"),
  selectDownloadFolder: () => electron.ipcRenderer.invoke("yandexMusicMod.selectDownloadFolder"),
  openFolder: (folderPath: string) => electron.ipcRenderer.invoke("yandexMusicMod.openFolder", folderPath),
  axios: (config: Record<string, unknown>) => electron.ipcRenderer.invoke("yandexMusicMod.axios", config),
});

electron.globalShortcut.register("CommandOrControl+Shift+I", () => {
  const focusedWindow = electron.BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.toggleDevTools();
  }
});
