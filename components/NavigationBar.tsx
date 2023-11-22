import React from 'react';
import { Stack } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../theme';

const NavigationBar = ({ title }: { title: string }) => {
  const { isConnected } = useNetInfo();

  return (
    <Stack.Screen
      options={{
        header({ navigation }) {
          const canGoBack = navigation.canGoBack();

          return (
            <View style={!isConnected ? [styles.header, styles.headerOffline] : styles.header}>
              <SafeAreaView edges={['left', 'right', 'top']}>
                {!isConnected ? (
                  <View style={styles.noInternetContent}>
                    <Text style={styles.noInternetText}>No internet connection</Text>
                    <FontAwesome name="exclamation-triangle" size={16} />
                  </View>
                ) : null}
                <View style={styles.headerContent}>
                  {canGoBack ? (
                    <Pressable onPress={navigation.goBack}>
                      <FontAwesome name="arrow-left" size={16} color="white" style={styles.arrowLeft} />
                    </Pressable>
                  ) : null}
                  <Text style={styles.title}>{title}</Text>
                </View>
              </SafeAreaView>
              <StatusBar style={!isConnected ? 'dark' : 'light'} />
            </View>
          );
        },
      }}
    />
  );
};

export default NavigationBar;

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.background,
  },
  headerOffline: {
    backgroundColor: 'lightgray',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  arrowLeft: {
    marginRight: 16,
  },
  noInternetContent: {
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  noInternetText: {
    fontWeight: 'bold',
    marginRight: 8,
  },
});
