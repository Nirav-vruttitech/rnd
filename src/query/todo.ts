export const todo_table = {
  createTbl:
    'CREATE TABLE IF NOT EXISTS Tasks (id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,description TEXT,completed INTEGER DEFAULT 0);',
  fetchData: `SELECT * FROM Tasks;`,
};

export const push_notification = {
  crateTbl: `CREATE TABLE IF NOT EXISTS notification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    response_status INTEGER NOT NULL CHECK(response_status IN (0, 1)),
    notification_time TEXT NOT NULL
    );`,
  fetchResponseNotification: `SELECT * FROM notification`,
  inserDara: `Insert into notification (response_status, notification_time) values (?,?);`,
};
