import { getTrackMeta, getProgress, isPlaying } from "~/mod/features/utils/player";
import * as Sentry from "@sentry/react";

let isRpcEnabled = true;
let showModButton = true;
let lastTrackId: string | null = null;

const POLL_INTERVAL = 2000;

window.__getPlayerState = () => {
  const trackMetaRequest = getTrackMeta();
  const playbackRequest = getProgress();
  const isPlayingRequest = isPlaying();

  if (trackMetaRequest.isErr()) {
    if (trackMetaRequest.error !== "upgrade_promocode") {
      Sentry.captureException("Error getting track meta:", { extra: { trackMetaRequest: trackMetaRequest.error } });
      console.error("Error getting track meta:", trackMetaRequest.error);
    }
    return {
      enabled: isRpcEnabled,
      showModButton: showModButton,
      data: null,
    };
  }

  if (playbackRequest.isErr()) {
    return {
      enabled: isRpcEnabled,
      showModButton: showModButton,
      data: null,
    };
  }

  if (isPlayingRequest.isErr()) {
    return {
      enabled: isRpcEnabled,
      showModButton: showModButton,
      data: null,
    };
  }

  return {
    enabled: isRpcEnabled,
    showModButton: showModButton,
    data: {
      trackMeta: trackMetaRequest.value,
      playback: playbackRequest.value,
      isPlaying: isPlayingRequest.value,
    },
  };
};

window.yandexMusicMod.onStorageChanged((key: string, value: any) => {
  if (key === "discordRPC/enabled" && value !== isRpcEnabled) isRpcEnabled = value;
  if (key === "discordRPC/showModButton" && value !== showModButton) showModButton = value;
});

(async () => {
  isRpcEnabled = (await window.yandexMusicMod.getStorageValue("discordRPC/enabled")) === false ? false : true;
  showModButton = (await window.yandexMusicMod.getStorageValue("discordRPC/showModButton")) === false ? false : true;
})();

setInterval(async () => {
  if (!isRpcEnabled) return;

  const trackMeta = getTrackMeta();
  if (trackMeta.isErr()) return;

  const trackId = trackMeta.value.id;
  if (trackId !== lastTrackId) {
    lastTrackId = trackId;
    try {
      await window.yandexMusicMod.setStorageValue("discordRPC/lastTrackId", trackId);
    } catch {
      // ignore
    }
  }
}, POLL_INTERVAL);
