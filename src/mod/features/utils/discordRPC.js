const { BrowserWindow } = require("electron");
const { Client } = require("@xhayper/discord-rpc");

const CLIENT_ID = "1283109459463377011";
const ACTIVITY_COOLDOWN = 10 * 1000;

let lastActivityChanged = Date.now();
let client;

function initRpc() {
  client = new Client({ clientId: CLIENT_ID });

  client.login().catch((e) => {
    console.error("[DISCORD RPC]", e);
    setTimeout(initRpc, 3000);
  });

  client.on("ready", () => {
    console.log("[DISCORD RPC] Hooked!");
    console.log("client.user", client.user?.username);
  });

  client.on("disconnected", () => {
    console.log("[DISCORD RPC] Disconnected");
    setTimeout(initRpc, 3000);
  });

  client.on("error", () => {
    console.log("[DISCORD RPC] Error");
    setTimeout(initRpc, 3000);
  });
  client.on("close", () => {
    console.log("[DISCORD RPC] Closed");
    setTimeout(initRpc, 3000);
  });
}

let lastTrackId = null;

async function updateActivity() {
  if (lastActivityChanged + ACTIVITY_COOLDOWN > Date.now()) return;
  if (!client.user) return;

  try {
    const playerState = await GetAppPlayerState();

    if (!playerState.enabled) {
      client.user.clearActivity();
      return;
    }

    const playerStateData = playerState.data;

    if (!playerStateData || !playerStateData.isPlaying) {
      client.user.clearActivity();
      return;
    }

    const trackId = playerStateData.trackMeta?.id;
    if (trackId && trackId === lastTrackId) return;
    lastTrackId = trackId;

    const startTimestamp = Math.round(Date.now() - playerStateData.playback.position * 1000);
    const endTimestamp = Math.round(
      Date.now() + (playerStateData.playback.duration - playerStateData.playback.position) * 1000,
    );

    const rpcRequest = {
      type: 2,
      details: playerStateData.trackMeta.version
        ? `${playerStateData.trackMeta.title} ${playerStateData.trackMeta.version}`
        : playerStateData.trackMeta.title,
      largeImageKey: playerStateData.trackMeta.coverUri
        ? `https://${playerStateData.trackMeta.coverUri.replaceAll("%%", "300x300")}`
        : undefined,
      largeImageKey: playerStateData.trackMeta.coverUri
        ? `https://${playerStateData.trackMeta.coverUri.replaceAll("%%", "100x100")}`
        : undefined,
      state: playerStateData.trackMeta.artists.map((a) => a.name).join(", "),
      startTimestamp: startTimestamp,
      endTimestamp: endTimestamp,
      buttons: [
        {
          label: "Открыть",
          url: `https://music.yandex.ru/track/${playerStateData.trackMeta.id}`,
        },
      ],
      instance: false,
    };

    if (playerState.showModButton) {
      rpcRequest.buttons.push({
        label: "Yandex Music Mod",
        url: `https://github.com/Stephanzion/YandexMusicBetaMod`,
      });
    }

    client.user.setActivity(rpcRequest);
    lastActivityChanged = Date.now();
  } catch (ex) {
    console.log("[DISCORD RPC]", ex);
  }
}

initRpc();

const { ipcMain } = require("electron");
ipcMain.on("yandexMusicMod.storageValueUpdated", (_ev, key) => {
  if (key === "discordRPC/lastTrackId") {
    updateActivity();
  }
});

ipcMain.on("yandexMusicMod.updateDiscordRPC", () => {
  updateActivity();
});

async function GetAppPlayerState() {
  const [win] = BrowserWindow.getAllWindows();
  if (win && !win.isDestroyed()) {
    return win.webContents.executeJavaScript(`
        (()=>{
            return window.__getPlayerState();
        })()
       `);
  }
}
