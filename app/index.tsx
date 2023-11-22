import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { apiClient } from '../api';
import { Container, FlatList, NavigationBar, Spacer } from '../components';
import { todoQueryKey } from '../query';
import { colors } from '../theme';
import { Todo } from '../types/todo';

export default function Todos() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: todoQueryKey.todos,
    queryFn: async function getTodos() {
      const { data }: { data: Todo[] } = await apiClient.get('/todos?sortBy=createdAt&order=desc');
      return data;
    },
  });

  const renderItem = ({ item }: { item: Todo }) => {
    return (
      <Pressable
        style={styles.item}
        onPress={() => {
          router.push({
            pathname: '/todo/[id]',
            params: {
              id: item.id,
            },
          });
        }}
      >
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.completed ? <FontAwesome name="check-circle" size={24} color="green" /> : null}
      </Pressable>
    );
  };

  return (
    <Container flex>
      <NavigationBar title="Todos" />
      <FlatList
        data={data}
        error={error}
        isLoading={isLoading}
        isError={isError}
        renderItem={renderItem}
        ListHeaderComponent={<Spacer />}
      />
      <Pressable style={styles.addButton} onPress={() => router.push('/todo/add')}>
        <FontAwesome name="plus" style={styles.addIcon} size={20} />
      </Pressable>
    </Container>
  );
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    height: 72,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    flex: 1,
  },
  addButton: {
    backgroundColor: colors.background,
    borderRadius: 9999,
    position: 'absolute',
    bottom: 16,
    right: 8,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    color: 'white',
  },
});
