import React, { FC } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useChatContext } from "./Hooks/useChatContext";

export const Badges: FC<{ badges?: string; }> = ({ badges }) => {

  if (!badges)
    return null;

  const { getBadge } = useChatContext();
  const badgesKeys = badges.split(",");

  return <View
    style={{
      flexDirection: "row",
    }}>{badgesKeys.map((badgeKey, i) => {
      const badgeUrl = getBadge(badgeKey);
      return <FastImage
        source={{ uri: badgeUrl }}
        style={{ width: 16, height: 16, marginRight: 3, }}
        key={badgeUrl + i.toString()} />;
    })}</View>;
};
