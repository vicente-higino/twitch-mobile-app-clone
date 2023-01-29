import React, { FC } from 'react';
import { Text, View } from 'react-native';
import { ChatMessage, useChat } from './useChat';
import { FlashList, ListRenderItem } from '@shopify/flash-list';


export const Chat: FC<{ login: string; }> = ({ login }) => {
  const messages = useChat({ login });
  const renderItem: ListRenderItem<ChatMessage> = (info) => {
    return <View>
      <Text style={{ color: info.item.color ?? "white", fontWeight: "bold" }}>
        {`${info.item['display-name']}: `}
        <Text style={{ color: "white", fontWeight: "normal" }}>{info.item['user-type']}</Text>
      </Text>
    </View>;
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
