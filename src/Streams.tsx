import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Button,
  FlatList, Pressable, RefreshControl,
  Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useGetRecommendedStreamsQuery } from './generated/graphql';
import { Stream } from './Stream';
import { NavigationProps } from './App';
import { SpinnigCircle } from './SpinnigCircle';
import { extractStream } from './utils/util';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';



export const Streams: FC<NavigationProps> = ({ navigation }) => {
  const [cacheId,] = useState(Date.now().toString());
  const { loading, error, data, refetch } = useGetRecommendedStreamsQuery({ variables: { random: cacheId, limit: 50 } });
  const [streams, setStreams] = useState<Stream[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [textInputValue, setTextInputValue] = useState("");
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch({ random: Date.now().toString() }).then(res => {
      setRefreshing(false);
    });
  }, []);

  const navigate = useCallback(
    (stream: Stream) => {
      navigation.navigate("Stream", { login: stream.login });
    },
    []
  );

  function updateStreamsArray(lives: Stream[]): void {
    setStreams(prev => {
      const map = new Map([...prev, ...lives].map(pos => [pos.id, pos]));
      return [...map.values()].sort((a, b) => a.viewCount < b.viewCount ? 1 : -1);
    });
  }

  useEffect(() => {
    if (data?.personalSections) {
      const lives: Stream[] = [];
      for (const p of data.personalSections) {
        if (!p.items) continue;
        for (const item of p.items) {
          if (!item.user?.stream) continue;
          const stream = extractStream(item.user.stream);
          stream && lives.push(stream);
        }
      }
      updateStreamsArray(lives);
    }
    if (data?.recommendedStreams?.edges) {
      const lives: Stream[] = [];
      for (const edge of data.recommendedStreams.edges) {
        const stream = extractStream(edge.node?.broadcaster?.stream);
        stream && lives.push(stream);
      }
      updateStreamsArray(lives);
    }

  }, [data]);

  if (loading) {
    return <SpinnigCircle />;
  }
  if (error) {
    return <View>
      <Text>error - {error.message}</Text>
    </View>;
  }
  return (
    <View >
      <View style={{ flexDirection: "row" }}>
        <TextInput
          placeholder='Go to streamer'
          onSubmitEditing={() => navigation.navigate("Stream", { login: textInputValue })}
          onChangeText={(text) => setTextInputValue(text.trimEnd())}
          style={{
            backgroundColor: "#757575",
            flexGrow: 1,
          }}
        />
        <TouchableOpacity
          style={{ flexBasis: 50, backgroundColor: "#ad00dd" }}
          onPress={() => navigation.navigate("Stream", { login: textInputValue })}
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faSearch} color="#f7f7f7" />
          </View>
        </TouchableOpacity>
      </View>
      <FlatList
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh} />}
        data={streams}
        keyExtractor={(item) => item.id}
        renderItem={(info) => {
          return <Stream stream={info.item} navigate={navigate} />;
        }}>
      </FlatList>
    </View >
  );
};
