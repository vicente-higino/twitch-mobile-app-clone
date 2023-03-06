import { z } from "zod";
import { emotes } from "../Chat";

 const emoticonSchema = z.object({
  name: z.string(),
  height: z.number().default(32),
  width: z.number().default(32),
  urls: z.record(z.union([z.literal("1"), z.literal("2"), z.literal("4")]), z.string()),
})

type emotion = z.infer<typeof emoticonSchema>;

const emoticonArraySchema = emoticonSchema.array();

export const ffEmotesSchema = z.record(z.object({ emoticons: emoticonArraySchema }))
  .transform(v => Object.values(v))
  .transform((arr) => {
    return arr
      .reduce<emotion[]>((prevArr, currentItem) => [...prevArr, ...currentItem.emoticons], [])
      .reduce<emotes>((prevObj, currentItem) => {
        if (currentItem.urls["1"])
          return {
            ...prevObj,
            [currentItem.name]: {
              name: currentItem.name,
              width: currentItem.width,
              height: currentItem.height,
              url: `https:${currentItem.urls["1"]}`
            }
          };
        return prevObj;
      }, {});
  })

export interface FFResponse {
  sets: Sets;
}

type Sets = Record<string, SetItem>;

interface SetItem {
  id: number;
  _type: number;
  icon?: any;
  title: string;
  css?: any;
  emoticons: Emoticon[];
}

export interface Emoticon {
  id: number;
  name: string;
  height: number;
  width: number;
  public: boolean;
  hidden: boolean;
  modifier: boolean;
  offset?: any;
  margins?: any;
  css?: any;
  owner: Owner;
  urls: Urls;
  status: number;
  usage_count: number;
  created_at: string;
  last_updated: string;
}

interface Urls {
  '1': string;
  '2'?: string;
  '4'?: string;
}

interface Owner {
  _id: number;
  name: string;
  display_name: string;
}