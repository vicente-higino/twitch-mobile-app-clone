import React, { FC } from 'react';
import { Button, Text, View } from 'react-native';
import { useGetUserQuery } from './generated/graphql';
import { Chat } from './Chat';
import { NavigationProps } from './App';
import { Stream } from "./Stream";
import { extractStream } from "./utils/util";
import { SpinnigCircle } from './SpinnigCircle';



export const StreamPage: FC<NavigationProps> = ({ route, navigation }) => {
  if (!route.params) return null;
  const { data, loading, error } = useGetUserQuery({ variables: { login: route.params.login } });
  const stream = extractStream(data?.user?.stream);

  if (loading) {
    return <SpinnigCircle />;
  }
  if (error) {
    return <Text>Erorr...</Text>;
  }
  if (stream) {
    return <View
      style={{ flex: 1 }}>
      <Stream stream={stream} live navigate={() => { }} />
      <Chat streamerName={stream.login} />
    </View>;
  }
  return (<View
    style={{ flex: 1 }}>
    <Text style={{ fontSize: 24, fontWeight: 'bold', color: "#fff" }}>{route.params.login} Offline Chat...</Text>
    <Button title='Go Back' onPress={() => navigation.goBack()} />
    <Chat streamerName={route.params.login} />
  </View>
  );
};
