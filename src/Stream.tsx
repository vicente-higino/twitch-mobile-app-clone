import React, { FC, useEffect, useState } from 'react';
import {
  ImageBackground,
  Pressable, Text, View
} from 'react-native';
import Video from "react-native-video";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { getTimePassed } from './utils/util';
import { SpinnigCircle } from './SpinnigCircle';
import { z } from "zod";


export const StreamSchema = z.object({
  id: z.string(),
  title: z.string(),
  game: z.string(),
  displayName: z.string(),
  login: z.string(),
  imgUrl: z.string().url(),
  viewCount: z.number(),
  isPartner: z.boolean(),
  streamUptime: z.string(),
  streamUrl: z.string().url(),
  createdAt: z.string().datetime(),
});

export type Stream = z.infer<typeof StreamSchema>;



export const Stream: FC<{ stream: Stream; live?: boolean; navigate: (stream: Stream) => void; }> = ({ stream, live = false, navigate }) => {
  const [cacheId, setCacheId] = useState(Date.now());
  const [streamUptime, setStreamUptime] = useState(getTimePassed(stream.createdAt));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setStreamUptime(getTimePassed(stream.createdAt));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <Pressable style={{ backgroundColor: "#000" }} onTouchEnd={() => navigate(stream)}>
      {live ?
        <Video
          style={{ width: "100%", aspectRatio: 16 / 9, position: "relative" }}
          source={{ uri: stream.streamUrl }}
          hideShutterView={true}
          onBuffer={() => setLoading(prev => !prev)}
        >
          {loading && <SpinnigCircle />}
        </Video>
        :
        <ImageBackground
          source={{ uri: stream.imgUrl + `?v=${cacheId}}` }}
          style={{ width: "100%", aspectRatio: 16 / 9, position: "relative" }}
          resizeMode="contain"
        >
          <View style={{
            backgroundColor: "#0000007e",
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            position: "absolute",
            bottom: 5,
            right: 5,
            paddingHorizontal: 6,
            paddingVertical: 3,
            borderRadius: 5
          }}>
            <FontAwesomeIcon size={12} icon={faClock} color="#ff8280" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 14, color: "#ff8280" }}>{streamUptime}</Text>
          </View>
        </ImageBackground>}
      <View style={{ paddingHorizontal: 10, paddingBottom: 5 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }} numberOfLines={2}>{stream.title}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginRight: 5 }}>{stream.displayName}</Text>
            {stream.isPartner && <FontAwesomeIcon icon={faCheckCircle} color="#bf94ff" />}
          </View>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: "center" }}>
            <FontAwesomeIcon icon={faUser} color="#ff8280" style={{ marginRight: 2 }} />
            <Text style={{ fontSize: 18, color: "#ff8280" }}>{stream.viewCount}</Text>
          </View>
        </View>
        <Text style={{ color: "#bf94ff" }}>{stream.game}</Text>
      </View>
    </Pressable>
  );
};
