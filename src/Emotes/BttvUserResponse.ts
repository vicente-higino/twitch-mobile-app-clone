import { z } from "zod";
import { emotes } from "../Chat";

export interface BttvUserResponse {
  id: string;
  bots: string[];
  avatar: string;
  channelEmotes: ChannelEmote[];
  sharedEmotes: SharedEmote[];
}

interface SharedEmote {
  id: string;
  code: string;
  imageType: string;
  animated: boolean;
  user: User;
  width?: number;
  height?: number;
}

interface User {
  id: string;
  name: string;
  displayName: string;
  providerId: string;
}

interface ChannelEmote {
  id: string;
  code: string;
  imageType: string;
  animated: boolean;
  userId: string;
  width?: number;
  height?: number;
}

export const bttvEmotesSchema = z.object({
  id: z.string(),
  code: z.string(),
  height: z.number().optional(),
  width: z.number().optional(),
}).transform((v) => {
  return {
    name: v.code,
    width: v.width ?? 32,
    height: v.height ?? 32,
    url: `https://cdn.betterttv.net/emote/${v.id}/1x`
  }
}).array().transform(arr => {
  return arr.reduce<emotes>((o, key) => ({ ...o, [key.name]: key }), {});
});