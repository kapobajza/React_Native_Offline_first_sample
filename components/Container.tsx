import { StyleSheet, View, ViewProps } from 'react-native';
import React from 'react';

type Props = {
  center?: boolean;
  flex?: boolean;
} & ViewProps;

const Container = ({ center, style, flex, ...props }: Props) => {
  const componentStyle = [StyleSheet.flatten(style)];

  if (center) {
    componentStyle.push(styles.center);
  }

  if (flex) {
    componentStyle.push(styles.flex);
  }

  return <View style={componentStyle} {...props} />;
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
