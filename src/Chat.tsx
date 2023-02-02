import React, { FC, useEffect, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import { ChatMessage, useChat } from './useChat';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useGetBadgesQuery } from './generated/graphql';
import { z } from "zod";


const badgeSchema = z.object({
  imageURL: z.string().url(),
  setID: z.string(),
  version: z.string()
});

type Badge = z.infer<typeof badgeSchema>;

function useGetBadges(login: string) {
  const { data, error, loading } = useGetBadgesQuery({ variables: { login } });
  const badges = useRef<Record<string, string>>({});
  function addBadge(badge: unknown) {
    const b = badgeSchema.safeParse(badge);
    if (b.success) {
      badges.current[`${b.data.setID}/${b.data.version}`] = b.data.imageURL;
    }
  }
  if (data?.badges) {
    for (const badge of data.badges) {
      addBadge(badge);
    }
  }
  if (data?.user?.broadcastBadges) {
    for (const badge of data.user.broadcastBadges) {
      addBadge(badge);
    }
  }
  return badges;

}


export const Chat: FC<{ login: string; }> = ({ login }) => {
  const messages = useChat({ login });
  const badgesMap = useGetBadges(login);

  const Badges: FC<{ badges?: string }> = ({ badges }) => {
    if (!badges) return null;
    const badgesKeys = badges.split(",");
    return <View
      style={{
        flexDirection: "row",
      }}>{
        badgesKeys.map((badgeKey) => {
          return <Image
            source={{ uri: badgesMap.current[badgeKey] }}
            style={{ width: 16, height: 16, marginRight: 3, }}
            key={badgesMap.current[badgeKey]} />
        })
      }</View>
  }
  const renderItem: ListRenderItem<ChatMessage> = (info) => {
    return <Text style={{ textAlignVertical: "center" }}>
      <View style={{ alignItems: "center", flex: 1, flexDirection: 'row' }}>
        <Badges badges={info.item.badges} />
        <Text style={{ color: info.item.color ?? "white", fontWeight: "bold" }}>
          {info.item['display-name']}
          <Text style={{ color: "white", fontWeight: "normal" }}>: </Text>
        </Text>
      </View>
      <Text style={{ color: "white", fontWeight: "normal" }}>{info.item['user-type']}</Text>
    </Text>;
  };

  return <View
    style={{ flexGrow: 1, minHeight: 300 }}>
    <FlashList
      data={messages}
      inverted
      estimatedItemSize={20}
      keyExtractor={(item, i) => item.id ?? i.toString()}
      renderItem={renderItem} />
  </View>;

};
