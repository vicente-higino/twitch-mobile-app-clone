import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  FlatList, RefreshControl,
  Text, View
} from 'react-native';
import { useGetRecommendedStreamsQuery } from './generated/graphql';
import { Stream } from './Stream';
import { NavigationProps } from './App';
import { SpinnigCircle } from './SpinnigCircle';
import { extractStream } from './utils/util';



export const Streams: FC<NavigationProps> = ({ navigation }) => {
  const [cacheId, setCacheId] = useState(Date.now().toString());
  const { loading, error, data, refetch } = useGetRecommendedStreamsQuery({ variables: { random: cacheId, limit: 50 } });
  const [streams, setStreams] = useState<Stream[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

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
      return [...map.values()];
    });
  }

  useEffect(() => {
    if (data?.personalSections) {
      const lives: Stream[] = [];
      for (const p of data.personalSections) {
        for (const item of p.items!) {
          if (item.user?.stream) {
            lives.push(extractStream(item.user.stream));
          }
        }
      }
      lives.sort((a, b) => a.viewCount < b.viewCount ? 1 : -1);
      updateStreamsArray(lives);
    }
    if (data?.recommendedStreams?.edges) {
      const lives: Stream[] = [];
      for (const edge of data.recommendedStreams.edges) {
        if (edge.node?.broadcaster?.stream) {
          lives.push(extractStream(edge.node?.broadcaster?.stream));
        }
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
  );
};
