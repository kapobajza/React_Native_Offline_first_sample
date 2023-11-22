export const todoQueryKey = {
  todos: ['todos'],
  details: (id: string) => [...todoQueryKey.todos, id],
} as const;

export const todoMutationKey = {
  add: ['addTodo'],
} as const;
