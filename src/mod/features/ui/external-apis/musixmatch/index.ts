import axios, { type AxiosInstance } from "axios";
import { Result, err, ok } from "neverthrow";
import { signRequestUrl } from "./utils";
import { type Lyrics, type Subtitle, type Track, type AllMetaResponse } from "./models";
import { Md5 } from "ts-md5";

const MUSIXMATCH_API_URL = "https://apic.musixmatch.com/ws/1.1/";

const baseApiParams = {
  app_id: "android-player-v1.0",
  country: "ru",
  format: "json",
};

interface MusixmatchApiConfig {
  usertoken?: string;
  cookie?: string;
}

class MusixmatchApi {
  private readonly client: AxiosInstance;
  private readonly usertoken: string;
  private readonly cookie: string;

  constructor(config: MusixmatchApiConfig = {}) {
    this.usertoken = config.usertoken ?? "250721b994519ea801e6582aeb61c797d5cecb501ed93b6c22e42d";
    this.cookie =
      config.cookie ??
      `x-mxm-token-guid=${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}; mxm-encrypted-token=; x-mxm-user-id=mxm:${Md5.hashStr(Math.random().toString())}`;

    this.client = axios.create({
      baseURL: MUSIXMATCH_API_URL,
      headers: {
        "Accept-Encoding": "gzip",
        "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 9; ASUS_I005DA Build/PI)",
        "x-mxm-endpoint": "default",
      },
    });
  }

  private buildParams(trackName: string, artistName: string, duration?: number) {
    const baseParams: Record<string, string> = {
      ...baseApiParams,
      usertoken: this.usertoken,
      q_track: trackName,
      q_artist: artistName,
      tags: "scrobbling,notifications",
      f_subtitle_length_max_deviation: "1",
      subtitle_format: "dfxp",
      page_size: "1",
      optional_calls: "track.richsync,crowd.track.actions",
      scrobbling_package: "ru.yandex.music",
      language_iso_code: "1",
      part: "lyrics_crowd,user,lyrics_vote,lyrics_poll,track_lyrics_translation_status,lyrics_verified_by,labels,track_structure",
    };

    if (duration !== undefined) {
      baseParams.f_subtitle_length = duration.toString();
      baseParams.q_duration = duration.toString();
    }

    return baseParams;
  }

  async getAllMetaRequest(trackName: string, artistName: string, duration?: number): Promise<Result<any, string>> {
    try {
      const params = new URLSearchParams(this.buildParams(trackName, artistName, duration));
      const url = `macro.subtitles.get?${params.toString()}`;
      const signedUrlResult = await signRequestUrl(url);

      if (signedUrlResult.isErr()) {
        return err(signedUrlResult.error.message);
      }

      const config = {
        method: "GET" as const,
        url: `${MUSIXMATCH_API_URL}${signedUrlResult.value}`,
        headers: {
          "accept-encoding": "gzip",
          "x-mxm-endpoint": "background",
          Cookie: this.cookie,
        },
      };

      return ok(config);
    } catch (error: any) {
      return err(error.message);
    }
  }

  async getAllMeta(trackName: string, artistName: string, duration?: number): Promise<Result<AllMetaResponse, string>> {
    const requestResult = await this.getAllMetaRequest(trackName, artistName, duration);
    if (requestResult.isErr()) return err(requestResult.error);

    try {
      const response = await axios.get(requestResult.value.url, {
        headers: {
          "accept-encoding": "gzip",
          Cookie: this.cookie,
        },
      });

      if (response.data.message.header.status_code !== 200) {
        return err(response.data.message.body);
      }

      return ok(response.data.message.body as AllMetaResponse);
    } catch (error: any) {
      return err(error.message);
    }
  }
}

export const musixmatchApi = new MusixmatchApi();
