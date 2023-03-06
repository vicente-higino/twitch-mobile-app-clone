import React, { FC } from 'react';
import { Text, View } from 'react-native';
import { ChatMessage, useChat } from './Hooks/useChat';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useGetBadges } from './Hooks/useGetBadges';
import { SpinnigCircle } from './SpinnigCircle';
import { useGetUserIdQuery } from './generated/graphql';
import FastImage from 'react-native-fast-image';
import { useGetEmotes } from './Hooks/useGetEmotes';
import { Badges } from './Badges';
import { useChatContext, ChatContext } from './Hooks/useChatContext';

export const Chat: FC<{ streamerName: string; }> = ({ streamerName }) => {
  const { data } = useGetUserIdQuery({ variables: { login: streamerName } });
  if (!data?.user?.id) return <SpinnigCircle />;
  const { getEmote, addEmotes } = useGetEmotes(data.user.id);
  const { getBadge } = useGetBadges(streamerName);

  return <View
    style={{ flexGrow: 1, minHeight: 300 }}>
    <ChatContext.Provider value={{ getEmote, getBadge, addEmotes }}>
      <MessageList {...{ streamerName }} />
    </ChatContext.Provider>
  </View>;

};

const MessageList: FC<{ streamerName: string; }> = ({ streamerName }) => {

  const [messages, loading] = useChat({ streamerName });

  if (loading) return <SpinnigCircle />

  const renderItem: ListRenderItem<ChatMessage> = info => <Message {...{ message: info.item }} />

  return <FlashList
    data={messages}
    inverted
    estimatedItemSize={20}
    removeClippedSubviews
    keyExtractor={(item, i) => item.id + i.toString()}
    renderItem={renderItem}
  />
}

const Message: FC<{
  message: ChatMessage,
}> = ({ message }) => {
  return <Text style={{ textAlignVertical: "center" }}>
    <View style={{ alignItems: "center", flex: 1, flexDirection: 'row' }}>
      <Badges badges={message.badges} />
      <Text style={{ color: message.color ?? "#fff", fontWeight: "bold" }}>
        {message['display-name']}
        <Text style={{ color: "white", fontWeight: "normal" }}>: </Text>
      </Text>
    </View>
    {message['user-type'] && <MessageTextWithEmotes message={message['user-type']} emotes={message["emotes"]} />}
  </Text>;
}

const MessageTextWithEmotes: FC<{ message: string, emotes?: string }> = ({ message, emotes }) => {
  const { getEmote, addEmotes } = useChatContext();
  if (emotes) addEmotes(emotes, message);

  return (
    <Text style={{ color: "white", fontWeight: "normal" }}>{message.split(" ").map((token, i) => {
      const emote = getEmote(token);
      return !emote ?
        <Text key={i}>{token} </Text> :
        <FastImage key={i} source={{
          uri: emote.url,
        }} style={{
          width: emote.width,
          height: emote.height,
        }} resizeMode="contain" />;
    })}</Text>
  );
}
