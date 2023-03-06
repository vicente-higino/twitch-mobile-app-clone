import { emote } from "./useGetEmotes";
import { createContext, useContext } from 'react';

export const useChatContext = () => useContext(ChatContext);

export const ChatContext = createContext<{
  getEmote: (emoteName: string) => emote | undefined,
  addEmotes: (emotes: string, message: string) => void,
  getBadge: (key: string) => string | undefined
}>({ addEmotes: () => { }, getEmote: () => { return undefined; }, getBadge: () => { return undefined; } });
