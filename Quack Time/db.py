"""
CS 422/522 Software Engineering Project 2: Quack-Time
Authors: Neal Kimchi, Nikhar Ramlakhan, Areyan Rastawan, Abie Safdie
Released: 06/03/2024

This file, database.py, defines functions that communicate directly to our database

See app.py for information on this software as a whole. As well as our other documentation that was apart of our submission

"""


import mysql.connector  # MySQL database connector
import bcrypt  # Password hashing library

# Database connection configuration
db_config = {
    'host': 'ix-dev.cs.uoregon.edu',
    'port': 3602,
    'user': 'qt_team',
    'password': 'quack',
    'database': 'quack_time'
}

class Database:
    """
    A class to interact with the Quack Time database for user authentication,
    task management, and logging functionality.

    Attributes:
        DuckID (str): The ID of the currently logged-in user.
    """

    def __init__(self):
        """
        Initializes the Database class with a placeholder for DuckID.
        """
        self.DuckID = None

    def connect_db(self):
        """
        Establishes a connection to the MySQL database.

        Returns:
            connection (MySQLConnection): A MySQL connection object if successful, None otherwise.
        """
        try:
            connection = mysql.connector.connect(**db_config)
            print("Connected to MySQL database!")
            return connection
        except mysql.connector.Error as err:
            print("Error:", err)
            return None

    def hash_password(self, password):
        """
        Hashes a plaintext password using bcrypt.

        Args:
            password (str): The plaintext password to be hashed.

        Returns:
            tuple: A tuple containing the hashed password and salt.
        """
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed_password.decode('utf-8'), salt.decode('utf-8')

    def store_user(self, duckid, firstname, lastname, password_hash, salt):
        """
        Stores a new user in the database.

        Args:
            duckid (str): The user's DuckID.
            firstname (str): The user's first name.
            lastname (str): The user's last name.
            password_hash (str): The hashed password.
            salt (str): The salt used in hashing the password.

        Returns:
            str: Success message or error message based on the operation outcome.
        """
        connection = self.connect_db()
        if len(duckid) != 9:
            print("Error: DuckID must be exactly 9 characters long.")
            return

        if connection:
            try:
                cursor = connection.cursor()
                cursor.execute(
                    "INSERT INTO Users (DuckID, FirstName, LastName, PassHash, PassSalt) VALUES (%s, %s, %s, %s, %s)",
                    (duckid, firstname, lastname, password_hash, salt))
                connection.commit()
                cursor.close()
                connection.close()
                return "User added successfully!"
            except mysql.connector.IntegrityError:
                connection.close()
                return "Error: User with this DuckID already exists!"
            except mysql.connector.Error as err:
                connection.close()
                return f"Error: {err}"

    def get_userPW(self, duckID):
        """
        Retrieves the password hash and salt for a given DuckID.

        Args:
            duckID (str): The DuckID of the user.

        Returns:
            dict: A dictionary containing the password hash and salt if the user exists, None otherwise.
        """
        connection = self.connect_db()
        if connection:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT PassHash, PassSalt FROM Users WHERE DuckID = %s", (duckID,))
            user = cursor.fetchone()
            cursor.close()
            connection.close()
            return user
        return None

    def verify_password(self, stored_password, provided_password, salt):
        """
        Verifies a provided password against the stored hash using bcrypt.

        Args:
            stored_password (str): The stored hashed password.
            provided_password (str): The plaintext password provided for verification.
            salt (str): The salt used in hashing the stored password.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password.encode('utf-8'))

    def get_first_name(self):
        """
        Retrieves the first name of the logged-in user.

        Returns:
            str: The first name of the user if found, None otherwise.
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("SELECT FirstName FROM Users WHERE DuckID = %s", (self.DuckID,))
            name = cursor.fetchone()
            cursor.close()
            return name[0] if name else None
        except mysql.connector.Error as err:
            print("Error:", err)
            return None

    def add_task_board(self, BoardName):
        """
        Adds a new task board to the database.

        Args:
            BoardName (str): The name of the task board to be added.

        Returns:
            None
        """
        if len(BoardName) == 0:
            print("Error: Task board cannot be empty")
            return
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("INSERT INTO TaskBoard (DuckID, BoardName) VALUES (%s, %s)", (self.DuckID, BoardName))
            connection.commit()
            cursor.close()
            print("Task board added successfully!")
        except mysql.connector.IntegrityError as e:
            print("Error: Invalid UserID!")
        except mysql.connector.Error as err:
            print("Error:", err)

    def store_task(self, BoardName, TaskName, TimeRemaining):
        """
        Stores a new task in the database.

        Args:
            BoardName (str): The name of the task board the task belongs to.
            TaskName (str): The name of the task.
            TimeRemaining (int): The estimated time remaining for the task.

        Returns:
            None
        """
        BoardID = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO Tasks (BoardID, TaskName, TimeRemaining) VALUES (%s, %s, %s)",
                (BoardID, TaskName, TimeRemaining))
            connection.commit()
            cursor.close()
            print("Task added successfully!")
        except mysql.connector.Error as err:
            print("Error storing task:", err)

    def get_task_boards(self):
        """
        Retrieves all task boards for the logged-in user.

        Returns:
            list: A list of task boards if any exist, None otherwise.
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("SELECT BoardName FROM TaskBoard WHERE DuckID = %s ORDER BY BoardName ASC", (self.DuckID,))
            task_boards = cursor.fetchall()
            cursor.close()
            return task_boards
        except mysql.connector.Error as err:
            print("Error:", err)
            return None

    def __get_board_id(self, BoardName):
        """
        Retrieves the board ID for a given board name.

        Args:
            BoardName (str): The name of the task board.

        Returns:
            int: The ID of the task board if found, None otherwise.
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("SELECT BoardID FROM TaskBoard WHERE DuckID = %s AND BoardName = %s", (self.DuckID, BoardName))
            board_id = cursor.fetchone()
            cursor.close()
            return board_id[0] if board_id else None
        except mysql.connector.Error as err:
            print("Error retrieving board ID:", err)
            return None

    def __get_task_id(self, BoardID, TaskName):
        """
        Retrieves the task ID for a given task name and board ID.

        Args:
            BoardID (int): The ID of the task board.
            TaskName (str): The name of the task.

        Returns:
            int: The ID of the task if found, None otherwise.
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("SELECT TaskID FROM Tasks WHERE BoardID = %s AND TaskName = %s", (BoardID, TaskName))
            task_id = cursor.fetchone()
            cursor.close()
            return task_id[0] if task_id else None
        except mysql.connector.Error as err:
            print("Error retrieving task ID:", err)
            return None

    def get_tasks(self, BoardName):
        """
        Retrieves all tasks for a given task board.

        Args:
            BoardName (str): The name of the task board.

        Returns:
            list: A list of tasks if any exist, None otherwise.
        """
        board_id = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("SELECT TaskName, TimeRemaining FROM Tasks WHERE BoardID = %s ORDER BY TaskName ASC;", (board_id,))
            tasks = cursor.fetchall()
            cursor.close()
            return tasks
        except mysql.connector.Error as err:
            print("Error:", err)
            return None

    def delete_task_board(self, BoardName):
        """
        Deletes a task board and all associated tasks from the database.

        Args:
            BoardName (str): The name of the task board to be deleted.

        Returns:
            None
        """
        board_id = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("DELETE FROM Tasks WHERE BoardID = %s;", (board_id, ))
            connection.commit()
            cursor.execute("DELETE FROM TaskBoard WHERE BoardID = %s;", (board_id, ))
            connection.commit()
            cursor.close()
        except mysql.connector.Error as err:
            print("Error:", err)

    def delete_task(self, BoardName, TaskName):
        """
        Deletes a task from a specific task board.

        Args:
            BoardName (str): The name of the task board.
            TaskName (str): The name of the task to be deleted.

        Returns:
            None
        """
        board_id = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("DELETE FROM Tasks WHERE BoardID = %s AND TaskName = %s;", (board_id, TaskName))
            connection.commit()
            cursor.close()
        except mysql.connector.Error as err:
            print("Error:", err)

    def update_task_time(self, BoardName, TaskName, SubtractTime):
        """
        Updates the remaining time for a task.

        Args:
            BoardName (str): The name of the task board.
            TaskName (str): The name of the task.
            SubtractTime (int): The new remaining time for the task.

        Returns:
            None
        """
        board_id = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("UPDATE Tasks SET TimeRemaining = %s WHERE BoardID = %s AND TaskName = %s;", (SubtractTime, board_id, TaskName))
            connection.commit()
            cursor.close()
        except mysql.connector.Error as err:
            print("Error:", err)

    def reduce_task_time(self, BoardName, TaskName, SubtractTime):
        """
        Reduces the remaining time for a task.

        Args:
            BoardName (str): The name of the task board.
            TaskName (str): The name of the task.
            SubtractTime (int): The amount of time to subtract from the remaining time.

        Returns:
            None
        """
        board_id = self.__get_board_id(BoardName)
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute("UPDATE Tasks SET TimeRemaining = TimeRemaining - %s WHERE BoardID = %s AND TaskName = %s;", (SubtractTime, board_id, TaskName))
            connection.commit()
            cursor.close()
        except mysql.connector.Error as err:
            print("Error:", err)

    def get_user_logs(self):
        """
        Retrieves all logs for the logged-in user.

        Returns:
            list: A list of logs if any exist, None otherwise.
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor(dictionary=True)
            query = """
            SELECT DATE_ADD(LogDate, INTERVAL 7 HOUR) AS Date, 
                   BoardName AS 'Board Name', 
                   TaskName AS 'Task Name', 
                   TimeSpent, 
                   Rating 
            FROM Logs 
            WHERE DuckID = %s 
            ORDER BY LogDate DESC;
            """
            cursor.execute(query, (self.DuckID,))
            logs = cursor.fetchall()
            cursor.close()
            return logs
        except mysql.connector.Error as err:
            print("Error retrieving user logs:", err)
            return None

    def store_feedback(self, TaskBoard, TaskName, TimeSpent, Rating):
        """
        Stores feedback for a task in the logs.

        Args:
            TaskBoard (str): The name of the task board.
            TaskName (str): The name of the task.
            TimeSpent (int): The time spent on the task.
            Rating (int): The productivity rating for the task.

        Returns:
            None
        """
        try:
            connection = self.connect_db()
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO Logs (DuckID, BoardName, TaskName, TimeSpent, Rating, LogDate) VALUES (%s, %s, %s, %s, %s, NOW())",
                (self.DuckID, TaskBoard, TaskName, TimeSpent, Rating)
            )
            connection.commit()
            cursor.close()
            connection.close()
        except mysql.connector.Error as err:
            print("Error storing feedback:", err)
