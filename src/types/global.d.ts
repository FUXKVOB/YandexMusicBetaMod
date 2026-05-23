interface TrackMeta {
  id: string;
  title: string;
  version?: string;
  durationMs: number;
  albumId: number;
  type: string;
  genre: string;
  isAvailable: boolean;
  available?: boolean;
  coverUri?: string;
  artists: { id: string; name: string }[];
  albums?: {
    id: number;
    title: string;
    year?: number;
    isAvailable: boolean;
    genre?: string;
    trackCount: number;
    trackPosition?: { index: number };
    releaseDate?: string;
  }[];
}

interface PlaybackState {
  duration: number;
  progress: number;
  position: number;
}

interface PlayerState {
  enabled: boolean;
  showModButton: boolean;
  data: {
    trackMeta: TrackMeta;
    playback: PlaybackState;
    isPlaying: boolean;
  } | null;
}

interface DownloadInfo {
  url: string;
  key: string;
  codec: string;
}

interface DownloadResult {
  ok: boolean;
  error?: string;
}

interface StorageChangeCallback {
  (key: string, value: unknown): void;
}

interface YandexMusicModApi {
  getStorageValue(key: string): Promise<unknown>;
  setStorageValue(key: string, value: unknown): Promise<void>;
  onStorageChanged(cb: StorageChangeCallback): () => void;
  downloadTrack(downloadInfo: DownloadInfo, trackMeta: TrackMeta, customDownloadPath?: string): Promise<DownloadResult>;
  openDownloadDirectory(): void;
  selectDownloadFolder(): Promise<{ success: boolean; path: string | null }>;
  openFolder(folderPath: string): Promise<{ success: boolean; error?: string }>;
  axios(config: Record<string, unknown>): Promise<{
    success: boolean;
    data?: unknown;
    error?: string;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  }>;
}

interface SentryHub {
  captureException(error: unknown, hint?: Record<string, unknown>): void;
  captureMessage(message: string, hint?: Record<string, unknown>): void;
  setUser(user: { id: string; username: string } | null): void;
  metrics: {
    count(name: string, value: number): void;
  };
  consoleLoggingIntegration: (opts: { levels: string[] }) => unknown;
  init(opts: Record<string, unknown>): void;
}

declare global {
  interface Window {
    yandexMusicMod: YandexMusicModApi;
    VERSION: string;
    __getPlayerState: () => PlayerState;
    __yandexMusicModAnalyticsEnabled?: boolean;
  }

  const Sentry: SentryHub | undefined;
}

export {};
