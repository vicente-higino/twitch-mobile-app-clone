/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { FC, useCallback, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  Animated,
  Button,
  Easing,
  FlatList,
  Image,
  ImageBackground,
  ListRenderItem,
  Pressable,
  RefreshControl,
  Text,
  useColorScheme,
  View,
} from 'react-native';


import Video from "react-native-video";
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { useGetRecommendedStreamsQuery, useGetUserQuery, UserPartsFragment } from './generated/graphql';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons/faUser';
import { faCheckCircle, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { formatTimeFromSeconds, getTimePassed } from './utils/util';
import { DarkTheme, DefaultTheme, NavigationAction, NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatMessage, useChat } from './useChat';

const client = new ApolloClient({
  uri: 'https://gql.twitch.tv/gql',
  headers: {
    "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
    "Authorization": "OAuth rrhc9kybloxuips6l3rc4omou9pigw",
    "Device-ID": "EmgWkrdknd6GrLJSr4G1kFKX68vfVgjg",
  },
  cache: new InMemoryCache(),
});

type RootStackParamList = {
  Home: undefined;
  Stream: { login: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home' | "Stream">;
const Stack = createNativeStackNavigator();
const App = () => {
  const scheme = useColorScheme();
  return (
    <ApolloProvider client={client}>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="Home"
            component={Streams}
          />
          <Stack.Screen
            name="Stream"
            component={StreamPage}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>

  );
};

type Stream = {
  id: string;
  title: string;
  game: string;
  displayName: string;
  login: string;
  imgUrl: string;
  viewCount: number;
  isPartner: boolean;
  streamUptime: string;
  streamUrl: string;
  createdAt: string;
}

function extractStream(stream: UserPartsFragment["stream"]): Stream {
  const id = stream?.broadcaster?.id ?? ""
  const title = stream?.broadcaster?.broadcastSettings?.title ?? ""
  const game = stream?.broadcaster?.broadcastSettings?.game?.displayName ?? ""
  const displayName = stream?.broadcaster?.displayName ?? ""
  const login = stream?.broadcaster?.login ?? ""
  const imgUrl = stream?.previewImageURL?.replace("{width}", "1280").replace("{height}", "720") ?? ""
  const viewCount = stream?.viewersCount ?? 0
  const isPartner = stream?.broadcaster?.roles?.isPartner ?? false
  const streamUptime = stream?.createdAt ? getTimePassed(stream.createdAt) : ""
  const createdAt = stream?.createdAt ?? ""
  const token = stream?.playbackAccessToken?.value ?? ""
  const sig = stream?.playbackAccessToken?.signature ?? ""
  const streamUrl = getHslStream({ login, sig, token })
  return { id, login, title, game, displayName, imgUrl, viewCount, isPartner, streamUptime, streamUrl, createdAt }
}

function getHslStream({ login, sig, token }: { login: string, sig: string, token: string }): string {
  const query = new URLSearchParams({
    allow_source: "true",
    allow_audio_only: "true",
    allow_spectre: "true",
    p: Math.floor(Math.random() * 1000000000).toString(),
    player: "twitchweb",
    playlist_include_framerate: "true",
    segment_preference: "4",
    sig,
    token
  }).toString()
  return `https://usher.ttvnw.net/api/channel/hls/${login}.m3u8?${query}`
}

export const Streams: FC<Props> = ({ navigation }) => {
  const [cacheId, setCacheId] = useState(Date.now().toString())
  const { loading, error, data, refetch } = useGetRecommendedStreamsQuery({ variables: { random: cacheId, limit: 50 } });
  const [streams, setStreams] = useState<Stream[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch({ random: Date.now().toString() }).then(res => {
      setRefreshing(false)
    });
  }, []);

  const navigate = useCallback(
    (stream: Stream) => {
      navigation.navigate("Stream", { login: stream.login })
    },
    [],
  )


  useEffect(() => {
    if (data?.personalSections) {
      const lives: Stream[] = []
      for (const p of data.personalSections) {
        for (const item of p.items!) {
          if (item.user?.stream) {
            lives.push(extractStream(item.user.stream))
          }
        }
      }
      lives.sort((a, b) => a.viewCount < b.viewCount ? 1 : -1)
      setStreams(lives)
    }
    if (data?.recommendedStreams?.edges) {
      const lives: Stream[] = []
      for (const edge of data.recommendedStreams.edges) {
        if (edge.node?.broadcaster?.stream) {
          lives.push(extractStream(edge.node?.broadcaster?.stream))
        }
      }
      setStreams(prev => [...prev, ...lives])
    }

  }, [data])

  if (loading) {
    return <View>
      <Text>Loading...</Text>
    </View>
  }
  if (error) {
    return <View>
      <Text>error...</Text>
    </View>
  }
  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />}
      data={streams}
      keyExtractor={(item) => item.id}
      renderItem={(info) => {
        return <Stream stream={info.item} navigate={navigate} />
      }}>
    </FlatList >
  )
}

const Stream: FC<{ stream: Stream, live?: boolean, navigate: (stream: Stream) => void }> = ({ stream, live = false, navigate }) => {
  const [cacheId, setCacheId] = useState(Date.now())
  const [streamUptime, setStreamUptime] = useState(getTimePassed(stream.createdAt))
  const [loading, setLoading] = useState(false)
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotate = () => {
    Animated.loop(Animated.timing(rotateAnim, { toValue: 360, useNativeDriver: true, easing: Easing.linear, duration: 1000 })).start();
  };
  useEffect(() => {
    rotate()
  }, [rotateAnim])
  useEffect(() => {
    const id = setInterval(() => {
      setStreamUptime(getTimePassed(stream.createdAt))
    }, 1000)

    return () => {
      clearInterval(id)
    }
  }, [])


  return (
    <Pressable style={{ backgroundColor: "#000" }} onTouchEnd={() => navigate(stream)}>
      {
        live ?
          <Video
            style={{ width: "100%", aspectRatio: 16 / 9, position: "relative" }}
            source={{ uri: stream.streamUrl }}
            hideShutterView={true}
            onBuffer={() => setLoading(prev => !prev)}
          >
            {loading && <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#00000082", zIndex: 99999 }}>
              <Animated.View style={{
                transform: [{
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg']
                  })
                }]
              }}>
                <FontAwesomeIcon style={{ color: "white" }} size={40} icon={faSpinner} />
              </Animated.View>
            </View>}
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
          </ImageBackground>

      }
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
  )
}


export const StreamPage: FC<Props> = ({ route, navigation }) => {
  const { data, loading, error } = useGetUserQuery({ variables: { login: route.params?.login ?? "" } });

  if (loading) {
    return <Text>Loading...</Text>
  }
  if (error) {
    return <Text>Erorr...</Text>
  }
  if (data?.user?.stream) {
    const stream = extractStream(data.user.stream)
    return <>
      <Stream stream={stream} live navigate={() => { }} />
      <Chat login={stream.login} />
    </>
  }
  return (<View>
    <Text>Offline...</Text>
    <Button title='Go Back' onPress={() => navigation.goBack()} />
  </View>
  )
}

export const Chat: FC<{ login: string }> = ({ login }) => {
  const messages = useChat({ login })
  const renderItem: ListRenderItem<ChatMessage>
    = (info) => {
      return <View>
        <Text style={{ color: info.item.color ?? "white", fontWeight: "bold" }}>{`${info.item['display-name']}: `}
          <Text style={{ color: "white", fontWeight: "normal" }}>{info.item['user-type']}</Text>
        </Text>
      </View>
    }

  return <View>
    <FlatList
      data={messages}
      inverted
      removeClippedSubviews
      contentContainerStyle={{ flexDirection: 'column-reverse', flexGrow: 1 }}
      keyExtractor={(item, i) => item.id ?? ""}
      renderItem={renderItem}
    />
  </View>

}

export default App;


