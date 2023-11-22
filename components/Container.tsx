import { StyleSheet, ViewProps } from 'react-native';
import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

type Props = {
  center?: boolean;
  flex?: boolean;
} & SafeAreaViewProps;

const Container = ({ center, style, flex, ...props }: Props) => {
  const componentStyle = [StyleSheet.flatten(style)];

  if (center) {
    componentStyle.push(styles.center);
  }

  if (flex) {
    componentStyle.push(styles.flex);
  }

  return <SafeAreaView style={componentStyle} edges={['bottom', 'left', 'right']} {...props} />;
};

export default Container;

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});
