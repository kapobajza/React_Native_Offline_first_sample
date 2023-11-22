import { StyleSheet, Text, TextInput } from 'react-native';
import React, { useState } from 'react';
import { Button, ButtonText, Container, NavigationBar } from '../../components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api';
import { todoQueryKey } from '../../query';
import { router } from 'expo-router';
import { Todo } from '../../types/todo';

const AddTodo = () => {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const { mutate: addTodo } = useMutation({
    mutationFn: async function addTodo(name: string) {
      await apiClient.post('/todos', {
        name,
        completed: false,
        createdAt: new Date().getTime(),
      });
    },
    onSettled() {
      setText('');
      queryClient.invalidateQueries({ queryKey: todoQueryKey.todos });
    },
    async onMutate(newTodo) {
      await queryClient.cancelQueries({ queryKey: todoQueryKey.todos });
      const previousTodos = queryClient.getQueryData(todoQueryKey.todos);
      queryClient.setQueryData<Todo[] | undefined>(todoQueryKey.todos, (old) => {
        if (old) {
          const createdAt = new Date().getTime();
          return [
            {
              id: `${createdAt}`,
              name: newTodo,
              createdAt,
              completed: false,
            },
            ...old,
          ];
        }
      });

      return { previousTodos };
    },
    onError(err, newTodo, context) {
      queryClient.setQueryData(todoQueryKey.todos, context?.previousTodos);
    },
  });

  return (
    <Container style={styles.container} flex>
      <NavigationBar title="Add todo" />
      <Text style={styles.addText}> Add a new todo</Text>
      <TextInput style={styles.addInput} value={text} onChangeText={setText} autoCapitalize="sentences" multiline />
      <Button
        onPress={() => {
          if (!text.trim()) {
            alert('Please enter the todo text');
            return;
          }

          addTodo(text);
          router.back();
        }}
      >
        <ButtonText>Submit</ButtonText>
      </Button>
    </Container>
  );
};

export default AddTodo;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  addText: {
    fontSize: 24,
    marginBottom: 16,
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'lightgray',
    padding: 8,
    maxHeight: 120,
    marginBottom: 24,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
