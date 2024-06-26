// Assigning each elelment of html to a constant variable by there id's
document.addEventListener('DOMContentLoaded', () => {
  const taskModal = document.getElementById('task-modal');
  const taskDetailsModal = document.getElementById('task-details');
  const taskForm = document.getElementById('task-form');
  const addTaskBtn = document.getElementById('add-task-btn');
  const closeBtn = document.getElementsByClassName('close')[0];
  const closeDetailsBtn = document.getElementsByClassName('close-details')[0];
  
  let currentTaskId = null;
  
  // Function to fetch the tasks (which are already created) from backend which is connected to database.
  async function fetchTasks() {
    const response = await fetch('/tasks');
    const tasks = await response.json();
    displayTasks(tasks);
  }
  
  // Function to display tasks in frontend web page.
  function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add('task-item');
      taskItem.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>Due Date: ${task.due_date}</p>
        <button class="view-task-btn" data-id="${task.id}">View Details</button>
      `;
      taskList.appendChild(taskItem);
      const viewBtn = taskItem.querySelector('.view-task-btn');
      viewBtn.addEventListener('click', () => viewTaskDetails(task.id));
    });
  }
  
  // when we click on check details this Function to view detailed task information
  async function viewTaskDetails(id) {
    const response = await fetch(`/tasks/${id}`);
    const task = await response.json();
    document.getElementById('details-title').textContent = task.title;
    document.getElementById('details-description').textContent = task.description;
    document.getElementById('details-due-date').textContent = task.due_date;
    currentTaskId = id;
    taskDetailsModal.style.display = 'block';
  }
  
  // Event listener for closing task details modal when we click edit task button
  closeDetailsBtn.onclick = () => {
    taskDetailsModal.style.display = 'none';
  };
  
  // Event listener for closing add/edit task modal-division
  closeBtn.onclick = () => {
    taskModal.style.display = 'none';
  };
  
  window.onclick = (event) => {
    if (event.target == taskModal) {
      taskModal.style.display = 'none';
    }
    if (event.target == taskDetailsModal) {
      taskDetailsModal.style.display = 'none';
    }
  };
  
  // Event listener for adding a new task in the db
  addTaskBtn.onclick = () => {
    document.getElementById('modal-title').textContent = 'Add Task';
    taskForm.reset();
    document.getElementById('task-id').value = '';
    taskModal.style.display = 'block';
  };
  
  // Event listener for submitting task form (add/edit)(Save button)
  taskForm.onsubmit = async (event) => {
    event.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const dueDate = document.getElementById('due-date').value;
  
    const task = { title, description, due_date: dueDate };
  
    if (id) {
      await fetch(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
    } else {
      await fetch('/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
    }
  
    taskModal.style.display = 'none';
    fetchTasks();
  };
  
  // Event listener for editing a task in db
  const editBtn = document.getElementById('edit-task-btn');
  editBtn.onclick = async () => {
    // Closing the details modal division
    taskDetailsModal.style.display = 'none';
    
    taskModal.style.display = 'block';
    document.getElementById('modal-title').textContent = 'Edit Task';
    const response = await fetch(`/tasks/${currentTaskId}`);
    const task = await response.json();
    document.getElementById('task-id').value = task.id;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('due-date').value = task.due_date;
  };
  
  // Event listener for deleting a task from db
  const deleteBtn = document.getElementById('delete-task-btn');
  deleteBtn.onclick = async () => {
    const confirmDelete = confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      await fetch(`/tasks/${currentTaskId}`, {
        method: 'DELETE'
      });
      taskDetailsModal.style.display = 'none';
      fetchTasks();
    }
  };
  
  // Initialling fetching the saved tasks from db when DOM content is loaded
  fetchTasks();
});
