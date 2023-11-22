import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import React, { ReactElement } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { Button, ButtonText, Container, NavigationBar } from '../../components';
import { Todo } from '../../types/todo';
import { todoQueryKey } from '../../query';
import { FontAwesome } from '@expo/vector-icons';

const TodoDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoading, data, fetchStatus } = useQuery({
    queryKey: todoQueryKey.details(id),
    queryFn: async function getTodo() {
      const { data }: { data: Todo } = await apiClient.get(`/todos/${id}`);
      return data;
    },
  });

  const queryClient = useQueryClient();

  const { mutate: markAsCompleted } = useMutation({
    async mutationFn(completed: boolean) {
      await apiClient.put(`/todos/${id}`, { completed });
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: todoQueryKey.todos });
      queryClient.invalidateQueries({ queryKey: todoQueryKey.details(id) });
    },
    async onMutate(completed) {
      await queryClient.cancelQueries({ queryKey: todoQueryKey.todos });
      await queryClient.cancelQueries({ queryKey: todoQueryKey.details(id) });

      const previousTodos = queryClient.getQueryData(todoQueryKey.todos);
      const previousTodoDetails = queryClient.getQueryData(todoQueryKey.details(id));

      queryClient.setQueryData<Todo[] | undefined>(todoQueryKey.todos, (old) => {
        if (old) {
          return old.map((todo) => {
            if (todo.id === id) {
              return {
                ...todo,
                completed,
              };
            }
            return todo;
          });
        }
      });

      queryClient.setQueryData<Todo | undefined>(todoQueryKey.details(id), (old) => {
        if (old) {
          return {
            ...old,
            completed,
          };
        }
      });

      return { previousTodos, previousTodoDetails };
    },
    onError(err, newTodo, context) {
      if (context?.previousTodos) {
        queryClient.setQueryData(todoQueryKey.todos, context?.previousTodos);
      }

      if (context?.previousTodoDetails) {
        queryClient.setQueryData(todoQueryKey.details(id), context?.previousTodoDetails);
      }
    },
  });

  let Content: ReactElement;

  if (isLoading) {
    Content = (
      <Container center>
        <ActivityIndicator />
      </Container>
    );
  } else if (fetchStatus === 'paused' && !data) {
    Content = (
      <Container style={styles.noContentContainer} center>
        <Text style={styles.noContentText}>This content is not available right now</Text>
        <FontAwesome name="exclamation-triangle" color="black" size={22} />
        <Text style={styles.noContentFurtherText}>Please connect to the internet in order to view it</Text>
      </Container>
    );
  } else {
    Content = (
      <>
        <Text style={styles.name}>{data?.name}</Text>
        <Button
          style={styles.completedButton}
          onPress={function onMarkAsCompletedPress() {
            markAsCompleted(!data?.completed);
          }}
        >
          <ButtonText style={styles.completedText}>Mark as {data?.completed ? 'not ' : ''}completed</ButtonText>
          <FontAwesome name="check-square" color="white" size={16} />
        </Button>
      </>
    );
  }

  return (
    <Container flex>
      <NavigationBar title="Todo details" />
      {Content}
    </Container>
  );
};

export default TodoDetails;

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    marginRight: 8,
  },
  noContentText: {
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  noContentContainer: {
    padding: 32,
  },
  noContentFurtherText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
