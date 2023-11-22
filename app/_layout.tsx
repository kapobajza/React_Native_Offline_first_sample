import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { DevSettings, useColorScheme } from 'react-native';
import createSqlitePersister from '../db/persister';
import { PersistQueryClientOptions, PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { dropDatabase, initDatabase } from '../db';
import NetInfo from '@react-native-community/netinfo';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const sqlitePersister = createSqlitePersister();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      retry: 2,
    },
  },
});

const onPersisterSuccess = () => {
  queryClient.resumePausedMutations();
};

const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: sqlitePersister,
  buster: 'v1',
};

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async function initializeApp() {
      if (__DEV__) {
        DevSettings.addMenuItem('Clear SQLite database', async function clearSqliteDb() {
          await dropDatabase();
          DevSettings.reload();
        });
      }

      await initDatabase();
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions} onSuccess={onPersisterSuccess}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
