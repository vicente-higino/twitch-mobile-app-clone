import { z } from "zod";
import { emotes } from "../Chat";

export interface SevenTvEmotes {
  id: string;
  name: string;
  owner: Owner;
  visibility: number;
  visibility_simple: string[];
  mime: string;
  status: number;
  tags: string[];
  width: number[];
  height: number[];
  urls: string[][];
}

interface Owner {
  id: string;
  twitch_id: string;
  login: string;
  display_name: string;
  role: Role;
  profile_picture_id?: string;
}

interface Role {
  id: string;
  name: string;
  position: number;
  color: number;
  allowed: number;
  denied: number;
}


export const sevenTvEmotesSchema = z.object({
  name: z.string(),
  width: z.number().array().nonempty(),
  height: z.number().array().nonempty(),
  urls: z.tuple([z.string(), z.string().url()]).array().nonempty()
}).transform((v) => {
  return {
    name: v.name,
    width: v.width[0],
    height: v.height[0],
    url: v.urls[0][1]
  }
}).array().transform(arr => {
  return arr.reduce<emotes>((o, key) => ({ ...o, [key.name]: key }), {});
});