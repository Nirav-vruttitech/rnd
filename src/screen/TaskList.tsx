import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {todo_table} from '../query/todo';
import {
  Task,
  addTask,
  createTable,
  deleteTask,
  fetchData,
  toggleComplete,
  updateTask,
} from '../service/database';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      await createTable(todo_table.createTbl);
      await loadTasks();
    })();
  }, []);

  // Load tasks from the database
  const loadTasks = async (): Promise<void> => {
    const tasksFromDb = await fetchData(todo_table.fetchData);
    setTasks(tasksFromDb);
  };

  // Add or update task
  const handleTaskSubmit = async (): Promise<void> => {
    if (!title.trim()) return;

    if (editMode && editId !== null) {
      await updateTask(editId, title, description);
      resetForm();
      loadTasks();
    } else {
      await addTask(title, description);
      resetForm();
      loadTasks();
    }
  };

  // Reset the form fields
  const resetForm = (): void => {
    setEditMode(false);
    setEditId(null);
    setTitle('');
    setDescription('');
  };

  // Delete a task
  const handleTaskDelete = async (id: number): Promise<void> => {
    await deleteTask(id, 'Tasks');
    loadTasks();
  };

  // Toggle task completion
  const handleToggleComplete = async (
    id: number,
    completed: number,
  ): Promise<void> => {
    await toggleComplete(id, completed === 1);
    await loadTasks();
  };

  // Handle task edit
  const handleTaskEdit = (task: Task): void => {
    setEditMode(true);
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TouchableOpacity style={styles.button} onPress={handleTaskSubmit}>
          <Text style={styles.buttonText}>
            {editMode ? 'Update Task' : 'Add Task'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.taskContainer}>
            <TouchableOpacity
              onPress={() => handleToggleComplete(item.id, item.completed)}>
              <Text>{item.completed ? '✅' : '◻️'}</Text>
            </TouchableOpacity>
            <View style={styles.taskDetails}>
              <Text
                style={[
                  styles.taskTitle,
                  item.completed ? styles.taskCompleted : null,
                ]}>
                {item.title}
              </Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => handleTaskEdit(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleTaskDelete(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  inputContainer: {marginBottom: 16},
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
    padding: 8,
  },
  button: {
    backgroundColor: 'black',
    padding: 5,
    borderRadius: 8,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    backgroundColor: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 5,
    borderRadius: 4,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  taskDetails: {flex: 1, marginLeft: 8},
  taskTitle: {fontSize: 16, fontWeight: 'bold'},
  taskDescription: {fontSize: 14, color: '#555'},
  taskCompleted: {textDecorationLine: 'line-through', color: 'gray'},
  buttonsContainer: {flexDirection: 'row', marginLeft: 10, gap: 10},
});

export default TaskList;
