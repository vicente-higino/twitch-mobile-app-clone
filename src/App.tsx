import React, { type PropsWithChildren, useMemo } from 'react';
import {
  Image,
  useColorScheme,
} from 'react-native';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { DarkTheme, DefaultTheme, NavigationAction, NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StreamPage } from './StreamPage';
import { Streams } from './Streams';
import { QueryClient, QueryClientProvider } from 'react-query';

const client = new ApolloClient({
  uri: 'https://gql.twitch.tv/gql',
  headers: {
    "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
    "X-Device-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
  },
  cache: new InMemoryCache(),
  
});

type RootStackParamList = {
  Home: undefined;
  Stream: { login: string };
};

export type NavigationProps = NativeStackScreenProps<RootStackParamList, 'Home' | "Stream">;

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

const App = () => {
  const scheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};

export default App;


