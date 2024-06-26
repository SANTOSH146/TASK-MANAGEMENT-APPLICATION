#importing required modules
from flask import Flask, request, jsonify, render_template
import mysql.connector
from flask_cors import CORS
#setting up flask application and static paths
app = Flask(__name__, static_url_path='', static_folder='../frontend')
CORS(app)

# MySQL database configuration details  
db_config = {
    'user': 'root',
    'password': '146752',
    'host': 'localhost',
    'database': 'kumar',
    'raise_on_warnings': True
}
#connecting to database
def get_db_connection():
    return mysql.connector.connect(**db_config)

# API routes

# function for Retrieve all tasks from table tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM tasks')
    tasks = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(tasks)

# function for Creating a new task in table tasks
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO tasks (title, description, due_date) VALUES (%s, %s, %s)',
        (data['title'], data['description'], data['due_date'])
    )
    conn.commit()
    task_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return jsonify({'id': task_id, 'title': data['title'], 'description': data['description'], 'due_date': data['due_date']}), 201

# function for Retrieving a single task by its ID from tasks table
@app.route('/tasks/<int:id>', methods=['GET'])
def get_task(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM tasks WHERE id = %s', (id,))
    task = cursor.fetchone()
    cursor.close()
    conn.close()
    if task:
        return jsonify(task)
    else:
        return jsonify({'error': 'Task not found'}), 404

# function for Updating the values in an existing task in db
@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE tasks SET title = %s, description = %s, due_date = %s WHERE id = %s',
        (data['title'], data['description'], data['due_date'], id)
    )
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'id': id, 'title': data['title'], 'description': data['description'], 'due_date': data['due_date']})

# function for deleting a task from table
@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return '', 204

#rendering html file when application started.
@app.route('/')
def index():
    return app.send_static_file('index.html')
#main function to run the application
if __name__ == '__main__':
    app.run(debug=True)
