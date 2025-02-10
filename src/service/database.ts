// @ts-ignore
import SQLite, {SQLiteDatabase} from 'react-native-sqlcipher-storage';

// Enable debug mode
// SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Define the type for a Task
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: number;
}

let db: SQLiteDatabase;

// Initialize and open the database
export const getDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    db = await SQLite.openDatabase({
      name: 'TasksDB.db',
      location: 'default',
      key: 'password',
    });
    console.log('Database opened successfully');
  } catch (error) {
    console.error('Error opening database: ', error);
    throw error;
  }
  return db;
};

// Create the Tasks table
export const createTable = async (query: string) => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(query);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table: ', error);
  }
};

// Fetch all tasks
export const fetchData = async (query: string): Promise<any[]> => {
  try {
    const dbInstance = await getDatabase();
    const [results] = await dbInstance.executeSql(query);
    const tasks: Task[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      tasks.push(results.rows.item(i));
    }
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks: ', error);
    return [];
  }
};

// Add a new task
export const addTask = async (
  title: string,
  description: string,
): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(
      'INSERT INTO Tasks (title, description) VALUES (?, ?);',
      [title, description],
    );
    console.log('Task added successfully');
  } catch (error) {
    console.error('Error adding task: ', error);
  }
};

export const insertData = async (
  query: string,
  array: Array<any>,
): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(query, array);
    console.log('Data Is Add Successfully');
  } catch (error) {
    console.log('error: ', error);
  }
};

// Update an existing task
export const updateTask = async (
  id: number,
  title: string,
  description: string,
): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(
      'UPDATE Tasks SET title = ?, description = ? WHERE id = ?;',
      [title, description, id],
    );
    console.log('Task updated successfully');
  } catch (error) {
    console.error('Error updating task: ', error);
  }
};

// Delete a task
export const deleteTask = async (
  id: number,
  tableName: string,
): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(`DELETE FROM ${tableName} WHERE id = ?;`, [id]);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task: ', error);
  }
};

export const toggleComplete = async (
  id: number,
  completed: boolean,
): Promise<void> => {
  console.log('Toggling task completion, id:', id, 'completed:', completed);

  try {
    const dbInstance = await getDatabase();

    // Convert the boolean completed status to 1 (true) or 0 (false)
    const updatedStatus = !completed ? 1 : 0;

    // Update the task status in the database
    const result = await dbInstance.executeSql(
      'UPDATE Tasks SET completed = ? WHERE id = ?;',
      [updatedStatus, id],
    );

    // Check if the update was successful (i.e., the task exists)
    if (result[0].rowsAffected > 0) {
      console.log('Task completion toggled successfully');
    } else {
      console.error('No task found with the given id:', id);
    }
  } catch (error) {
    console.error('Error toggling task completion: ', error);
  }
};
