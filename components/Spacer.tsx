import { View } from 'react-native';
import React from 'react';

const Spacer = ({ height = 24 }: { height?: number }) => {
  return <View style={{ height }} />;
};

export default Spacer;
