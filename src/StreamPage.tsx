import React, { FC } from 'react';
import { Button, Text, View } from 'react-native';
import { useGetUserQuery } from './generated/graphql';
import { Chat } from './Chat';
import { NavigationProps } from './App';
import { Stream } from "./Stream";
import { extractStream } from "./utils/util";
import { SpinnigCircle } from './SpinnigCircle';



export const StreamPage: FC<NavigationProps> = ({ route, navigation }) => {
  const { data, loading, error } = useGetUserQuery({ variables: { login: route.params?.login ?? "" } });
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
      <Chat login={stream.login} />
    </View>;
  }
  return (<View>
    <Text>Offline...</Text>
    <Button title='Go Back' onPress={() => navigation.goBack()} />
  </View>
  );
};
