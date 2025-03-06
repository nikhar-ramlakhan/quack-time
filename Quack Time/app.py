"""
CS 422/522 Software Engineering Project 2: Quack-Time

Authors:
    Neal Kimchi, Nikhar Ramlakhan, Areyan Rastawan, Abie Safdie

Released:
    06/03/2024

This file, app.py, serves as our main driver for our quack time web app.

Brief Description of System:

    Quack-Time is a web app that provides a way to visualize user tasks and needed completion times and productivity with those tasks.
    It follows the Pomodoro method, which states that users are most productive by working in 25-minute sessions followed by 5-minute breaks. Please see the SRS document for more information on the Pomodoro Method.

    A typical use-case will see users creating "task boards" to hold their tasks. Then users will start timers and work on such tasks.

    Upon completion of the timer, users self-input their productivity with the task they worked on.

    There is a “proDUCKtivity” log, so the user can further visualize their productivity.

    Quack-Time is University of Oregon themed and is geared towards students to use as a study tool.

To set up the application and more information on how to use this software see our Installation Instruction.pdf
    and our programmer and user documentation pdfs located in our submission. As well as our README.txt file

Brief explanation on how to use:
    - type "python3 app.py" into your terminal (make sure you are in the directory containing app.py)
    - navigate to "localhost:5002" in your browser
"""

from flask import Flask, render_template, request, redirect, session, url_for, jsonify  # for web app
from functools import wraps     # python standard library for forcing logins
from db import *                # helper db file for database interactions

app = Flask(__name__, static_url_path='/static')   # initazliae our flask app
app.secret_key = 'key'                              # set up key to handle saving user sessions

quack_time_db = Database()  # Initialize the database

def login_required(f):
    """
        Checks to see if a web app path requires a login to be accessed
    :param f:   web app page
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function


@app.route('/')
def login():
    """
    Render the login page.
    """
    return render_template('login.html')


@app.route('/login', methods=['GET', 'POST'])
def handle_login():
    """
    Handle user login. If the request method is GET, redirect to the login page.
    If the request method is POST, validate the user's credentials and redirect to the homepage on success.
    """
    if request.method == 'GET':
        return redirect('/')

    username = request.form['username']
    password = request.form['password']

    pw = quack_time_db.get_userPW(username)
    if pw and quack_time_db.verify_password(pw['PassHash'], password, pw['PassSalt']):
        session['username'] = username
        quack_time_db.DuckID = username
        return redirect('/homepage')
    else:
        return render_template('login.html', alert_message="Incorrect username or password")


@app.route('/create_user', methods=['GET', 'POST'])
def handle_create_user():
    """
    Handle user creation. If the request method is POST, create a new user with the provided details.
    If successful, redirect to the login page. If the request method is GET, render the user creation page.
    """
    if request.method == 'POST':        # post means someone inputted their info to create user
        # get our user info from the data the user inputted
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        duckid = request.form['duckid']
        password = request.form['password']

        # check to see if user can be added
        if firstname and lastname and duckid and password:
            hashed_password, salt = quack_time_db.hash_password(password)
            res = quack_time_db.store_user(duckid, firstname, lastname, hashed_password, salt)
            if res == "User added successfully!":
                return redirect('/')
            else:
                return render_template('create_user.html', alert_message=res)
    else:   # else means loading page for the first time
        return render_template('create_user.html')


@app.route('/homepage', methods=['GET', 'POST'])
@login_required
def homepage():
    """
    Render the homepage for logged-in users. Displays the user's first name.
    """
    firstname = quack_time_db.get_first_name()  # get the name of user from the db
    if request.method == 'GET':
        return render_template('homepage.html', firstname=firstname)


@app.route('/add-task', methods=['POST'])
def add_task():
    """
    Add a task or task board item based on the provided data.
    """
    data = request.json
    task_type = data.get('type')

    if task_type == 'taskBoardItem':
        task_board_item_name = data.get('name')
        quack_time_db.add_task_board(task_board_item_name)
    elif task_type == 'task':
        task_board_item_name = data.get('taskBoardItem')
        task_name = data.get('name')
        task_time = data.get('time')
        task_time = int(task_time)
        quack_time_db.store_task(task_board_item_name, task_name, task_time)
    else:
        return jsonify({'message': 'Invalid task type'}), 400

    return jsonify({'message': 'Task added successfully!'})


@app.route('/get-task-boards', methods=['GET'])
def get_task_boards():
    """
    Retrieve all task boards from the database and return them as a JSON response.
    """
    boards = quack_time_db.get_task_boards()

    if boards is None or len(boards) == 0:
        return jsonify([])

    return jsonify(boards)


@app.route('/get-tasks', methods=['GET'])
def get_tasks():
    """
    Retrieve all tasks for a given task board from the database and return them as a JSON response.
    """
    board_name = request.args.get('boardName')
    tasks = quack_time_db.get_tasks(board_name)
    return jsonify(tasks)


@app.route('/del-task-board', methods=['POST'])
def del_task_board():
    """
    Delete a task board from the database.
    """
    data = request.json
    quack_time_db.delete_task_board(data)
    return jsonify(None)


@app.route('/del-task', methods=['POST'])
def del_task():
    """
    Delete a task from the database.
    """
    data = request.json
    board = data.get('board')
    task_name = data.get('name')
    quack_time_db.delete_task(board, task_name)
    return jsonify(None)


@app.route('/update-time', methods=['POST'])
def update_time():
    """
    Update the time remaining for a task in the database.
    """
    data = request.json
    board = data.get('board')
    task_name = data.get('name')
    time = data.get('time')
    quack_time_db.update_task_time(board, task_name, time)
    return jsonify(None)


@app.route('/logout')
def logout():
    """
    Log out the current user by clearing the session and redirect to the login page.
    """
    session.pop('username', None)
    return redirect('/')


@app.route('/logs')
def logs():
    """
    Render the logs page.
    """
    return render_template('logs.html')


@app.route('/get-logs')
@login_required
def get_logs():
    """
    Retrieve all logs for the current user and return them as a JSON response.
    """
    logs = quack_time_db.get_user_logs()
    return jsonify(logs)


@app.route('/submit-feedback', methods=['POST'])
@login_required
def submit_feedback():
    """
    Submit feedback for a task and update the task time based on the productivity rating.
    """
    data = request.json
    taskBoard = data.get('taskBoard')
    task = data.get('task')
    total_time = data.get('timer')
    rating = data.get('rating')
    new_time = data.get('newTime')
    total_time = total_time / 60000

    try:
        total_time = int(total_time)
        rating = int(rating)
    except ValueError:
        return jsonify({'error': 'Invalid input format'}), 400

    quack_time_db.store_feedback(taskBoard, task, total_time, rating)
    quack_time_db.update_task_time(taskBoard, task, new_time)
    return jsonify(None)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
