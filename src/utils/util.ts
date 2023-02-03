import { Stream, StreamSchema } from "../Stream";
import { UserPartsFragment } from "../generated/graphql";

export function getTimePassed(time: string) {
  const date = new Date(time);
  return formatTimeFromSeconds((Date.now() - date.getTime()) / 1000);

}
export function formatTimeFromSeconds(time: number) {
  const hours = Math.floor(time / 60 / 60).toString().padStart(2, "0");
  const mins = Math.floor((time / 60) % 60).toString().padStart(2, "0");
  const secs = Math.floor(time % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
}

export function getHslStream({ login, sig, token }: { login?: string, sig?: string, token?: string }): string {
  if (!login || !sig || !token) return "";

  const query = new URLSearchParams({
    allow_source: "true",
    allow_audio_only: "true",
    allow_spectre: "true",
    p: Math.floor(Math.random() * 1000000000).toString(),
    player: "twitchweb",
    playlist_include_framerate: "true",
    segment_preference: "4",
    sig,
    token
  }).toString()
  return `https://usher.ttvnw.net/api/channel/hls/${login}.m3u8?${query}`
}

export function extractStream(stream: UserPartsFragment["stream"]): Stream | null {
  const id = stream?.broadcaster?.id;
  const title = stream?.broadcaster?.broadcastSettings?.title;
  const game = stream?.broadcaster?.broadcastSettings?.game?.displayName;
  const displayName = stream?.broadcaster?.displayName;
  const login = stream?.broadcaster?.login;
  const imgUrl = stream?.previewImageURL?.replace("{width}", "1280").replace("{height}", "720");
  const viewCount = stream?.viewersCount;
  const isPartner = stream?.broadcaster?.roles?.isPartner;
  const streamUptime = stream?.createdAt && getTimePassed(stream.createdAt);
  const createdAt = stream?.createdAt;
  const token = stream?.playbackAccessToken?.value;
  const sig = stream?.playbackAccessToken?.signature;
  const streamUrl = getHslStream({ login, sig, token });
  const streamParsed = StreamSchema.safeParse({ id, login, title, game, displayName, imgUrl, viewCount, isPartner, streamUptime, streamUrl, createdAt });
  return streamParsed.success ? streamParsed.data : null;
}