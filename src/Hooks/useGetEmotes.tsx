import { z } from "zod";
import {  FFResponse,  ffEmotesSchema } from "../Emotes/FFResponse";
import { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import axios from "axios";
import { BttvGlobalResponse } from "../Emotes/BttvGlobalResponse";
import { BttvUserResponse, bttvEmotesSchema } from "../Emotes/BttvUserResponse";
import { SevenTvEmotes, sevenTvEmotesSchema } from "../Emotes/SevenTvResponse";

export function useGetEmotes(streamerId: string) {
  const { data: emotesMap, } = useQuery(['emotes', streamerId], () => getEmotes(streamerId));
  const emotesMapRef = useRef<emotes>({});
  useEffect(() => {
    if (emotesMap)
      emotesMapRef.current = emotesMap;
  }, [emotesMap]);
  const getEmote = (emoteName: string): emote | undefined => emotesMapRef.current[emoteName];
  const addEmotes = (emotes: string, message: string): void => {
    emotes
      .split("/")
      .forEach(element => {
        const [id, position] = element.split(":");
        if (!position || !id)
          return;
        const [first, last] = position?.split("-");
        if (!first || !last)
          return;
        const emoteName = message.slice(Number(first), Number(last) + 1);
        emotesMapRef.current[emoteName] = {
          name: emoteName,
          width: 28,
          height: 28,
          url: `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/1.0`
        };
      });
  };
  return { getEmote, addEmotes };
}

export const getEmotes = async (streamerId: string) => {
  try {
    const sevenTvGlobal = axios.get<SevenTvEmotes[]>("https://api.7tv.app/v2/emotes/global", { validateStatus: () => true });
    const sevenTvUser = axios.get<SevenTvEmotes[]>(`https://api.7tv.app/v2/users/${streamerId}/emotes`, { validateStatus: () => true });
    const bttvGlobal = axios.get<BttvGlobalResponse[]>(`https://api.betterttv.net/3/cached/emotes/global`, { validateStatus: () => true });
    const bttvUser = axios.get<BttvUserResponse>(`https://api.betterttv.net/3/cached/users/twitch/${streamerId}`, { validateStatus: () => true });
    const ffGlobal = axios.get<FFResponse>(`https://api.frankerfacez.com/v1/set/global`, { validateStatus: () => true });
    const ffUser = axios.get<FFResponse>(`https://api.frankerfacez.com/v1/room/id/${streamerId}`, { validateStatus: () => true });
    const [sevenTvGlobalRes, sevenTvUserRes, bttvGlobalRes, bttvUserRes, ffUserRes, ffGlobalRes] =
      await Promise.all([sevenTvGlobal, sevenTvUser, bttvGlobal, bttvUser, ffUser, ffGlobal]);
    let emotes: emotes = {};
    function addEmotesSet<T extends z.SafeParseReturnType<unknown, emotes>>(params: T) {
      if (params.success) emotes = { ...emotes, ...params.data };
    }
    //The order is important!
    //This is needed to override duplicated emotes
    addEmotesSet(ffEmotesSchema.safeParse(ffGlobalRes.data.sets));
    addEmotesSet(ffEmotesSchema.safeParse(ffUserRes.data.sets));
    addEmotesSet(bttvEmotesSchema.safeParse(bttvGlobalRes.data));
    addEmotesSet(bttvEmotesSchema.safeParse(bttvUserRes.data.sharedEmotes));
    addEmotesSet(bttvEmotesSchema.safeParse(bttvUserRes.data.channelEmotes));
    addEmotesSet(sevenTvEmotesSchema.safeParse(sevenTvGlobalRes.data));
    addEmotesSet(sevenTvEmotesSchema.safeParse(sevenTvUserRes.data));
    return emotes;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export type emote = {
  name: string;
  width: number;
  height: number;
  url: string;
};

export type emotes = Record<string, emote | undefined>;
