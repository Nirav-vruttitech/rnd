import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

// Enable debug mode
SQLite.DEBUG(true);
SQLite.enablePromise(true);

// Define the type for a Task
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: number; // 0 for incomplete, 1 for complete
}

let db: SQLiteDatabase | null = null;

// Initialize and open the database
export const getDatabase = async (): Promise<SQLiteDatabase> => {
  try {
    db = await SQLite.openDatabase({
      name: 'TasksDB.db',
      location: 'default',
    });
    console.log('Database opened successfully');
    return db;
  } catch (error) {
    console.error('Error opening database: ', error);
    throw error;
  }
};

// Create the Tasks table
export const createTable = async (): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(`
      CREATE TABLE IF NOT EXISTS Tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        completed INTEGER DEFAULT 0
      );
    `);
    console.log('Table created successfully');
  } catch (error) {
    console.error('Error creating table: ', error);
  }
};

// Fetch all tasks
export const fetchTasks = async (): Promise<Task[]> => {
  try {
    const dbInstance = await getDatabase();
    const [results] = await dbInstance.executeSql('SELECT * FROM Tasks;');
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
export const deleteTask = async (id: number): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql('DELETE FROM Tasks WHERE id = ?;', [id]);
    console.log('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task: ', error);
  }
};

// Toggle task completion
export const toggleComplete = async (
  id: number,
  completed: boolean,
): Promise<void> => {
  try {
    const dbInstance = await getDatabase();
    await dbInstance.executeSql(
      'UPDATE Tasks SET completed = ? WHERE id = ?;',
      [completed ? 1 : 0, id],
    );
    console.log('Task completion toggled successfully');
  } catch (error) {
    console.error('Error toggling task completion: ', error);
  }
};
