import { Pressable, PressableProps, StyleProp, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { colors } from '../theme';
import { TextProps } from 'react-native';
import { ViewStyle } from 'react-native';

export const Button = ({ style, ...props }: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle> }) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        ...styles.button,
        ...StyleSheet.flatten(style),
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
      {...props}
    />
  );
};

export const ButtonText = ({ style, ...props }: TextProps) => {
  return <Text style={[styles.text, StyleSheet.flatten(style)]} {...props} />;
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
