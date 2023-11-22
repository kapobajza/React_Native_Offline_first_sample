import { ActivityIndicator, FlatList as RNFlatList, FlatListProps, Text } from 'react-native';
import React from 'react';
import Container from './Container';

type Props<TItem> = {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
} & FlatListProps<TItem>;

const FlatList = <TItem,>({ isLoading, isError, error, ...flatListProps }: Props<TItem>) => {
  if (isLoading) {
    return (
      <Container center>
        <ActivityIndicator />
      </Container>
    );
  }

  if (isError && error) {
    return (
      <Container center>
        <Text>{error.message}</Text>
      </Container>
    );
  }

  return <RNFlatList showsVerticalScrollIndicator={false} {...flatListProps} />;
};

export default FlatList;
