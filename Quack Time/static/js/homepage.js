/**
 * This JavaScript file handles the functionality for the homepage and task management system.
 * It includes modal management, form submission, task board and task handling, and AJAX requests.
 */

// Modal elements
var modal = document.getElementById("taskModal");
var btnTaskBoard = document.getElementById("openModalTaskBoard");
var btnTasks = document.getElementById("openModalTasks");
var closeBtn = document.getElementsByClassName("close")[2];

// Form elements
var taskForm = document.getElementById("taskForm");
var taskBoardList = document.getElementById("taskBoardList");
var tasksList = document.getElementById("tasksList");
var taskInput = document.getElementById("taskInput");
var modalTitle = document.getElementById("modalTitle");

// How-to-use modal elements
var howToUseModal = document.getElementById("how-to-modal");
var howToUseBtn = document.getElementById("how-to-button");
var howToUseCloseBtn = document.getElementsByClassName("close")[3];

// Remove task board modal elements
var btnRemoveTaskBoard = document.getElementById("removeModalTaskBoard");
var removeTaskBoardModal = document.getElementById("removetaskBoardModal");
var removeBoardCloseBtn = document.getElementsByClassName("close")[4];

// Remove tasks modal elements
var btnRemoveTasks = document.getElementById("removeModalTask");
var removeTasksModal = document.getElementById("removeTasksModal");
var removeTaskCloseBtn = document.getElementsByClassName("close")[5];

// Edit tasks modal elements
var editModalTask = document.getElementById("editModalTask");
var editTimeTasksModal = document.getElementById("editTimeTasksModal");
var editTimeTaskCloseBtn = document.getElementsByClassName("close")[6];

// Loading screen element
var loadingScreen = document.getElementById("loadingScreen");

// Task board data and current selection
var taskBoardData = {};
var currentTaskBoardItem = null;

/**
 * Initializes the page by showing the loading screen, fetching task boards and tasks, and rendering them.
 */
window.onload = function () {
    showLoadingScreen();
    fetchTaskBoard().then(() => {
        return Promise.all(Object.keys(taskBoardData).map(boardName => fetchTasks(boardName)));
    }).then(() => {
        renderTaskBoards(taskBoardData);
        hideLoadingScreen();
    }).catch(err => {
        console.error('Error loading data:', err);
        hideLoadingScreen();
    });
};

/**
 * Displays the loading screen.
 */
function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
}

/**
 * Hides the loading screen.
 */
function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
}

/**
 * Fetches the task boards from the server and stores them in taskBoardData.
 */
async function fetchTaskBoard() {
    const response = await fetch("/get-task-boards");
    if (response.ok) {
        const boardList = await response.json();
        for (let i = 0; i < boardList.length; i++) {
            taskBoardData[boardList[i][0]] = [];
        }
    } else {
        console.error('Failed to fetch task boards');
    }
}

/**
 * Fetches the tasks for a given task board from the server and stores them in taskBoardData.
 * @param {string} boardName - The name of the task board.
 */
async function fetchTasks(boardName) {
    const response = await fetch(`/get-tasks?boardName=${boardName}`);
    if (response.ok) {
        const taskList = await response.json();
        for (let i = 0; i < taskList.length; i++) {
            let taskName = taskList[i][0];
            let taskTime = taskList[i][1].toString();
            taskBoardData[boardName].push({ name: taskName, time: taskTime });
        }
    } else {
        console.error(`Failed to fetch tasks for board ${boardName}`);
    }
}

/**
 * Renders the task boards and their associated tasks.
 * @param {object} data - The task board data.
 */
function renderTaskBoards(data) {
    taskBoardList.innerHTML = '';
    for (var taskBoardItemName in data) {
        addTaskBoardItemToList(taskBoardItemName);
        if (data[taskBoardItemName].length > 0) {
            renderTasksListForBoardItem(taskBoardItemName, data[taskBoardItemName]);
        }
    }
}

// Event handlers

/**
 * Handles the click event for the "Add Task Board Item" button.
 * Displays the modal for adding a new task board item.
 */
btnTaskBoard.onclick = function () {
    modalTitle.textContent = "Add Task Board Item";

    var taskBoardLabel = document.getElementById("TaskLabel");
    taskBoardLabel.textContent = "Task Board Name: ";

    var submitTaskBoard = document.getElementById("submitTask");
    submitTaskBoard.textContent = "Add Task Board";

    taskInput.value = "";
    document.getElementById("timeNeededLabel").style.display = "none";
    document.getElementById("taskTimeNeeded").style.display = "none";
    document.getElementById("taskTimeNeeded").value = '1';
    modal.style.display = "block";
};

/**
 * Handles the click event for the "Add Task" button.
 * Displays the modal for adding a new task to the selected task board item.
 */
btnTasks.onclick = function () {
    var taskLabel = document.getElementById("TaskLabel");
    taskLabel.textContent = "Task Name: ";

    var submitTaskBoard = document.getElementById("submitTask");
    submitTaskBoard.textContent = "Add Task";
    if (currentTaskBoardItem) {
        modalTitle.textContent = "Add Task for " + currentTaskBoardItem;
        taskInput.value = "";
        if (modalTitle.textContent.startsWith("Add Task for")) {
            document.getElementById("taskTimeNeeded").style.display = "block";
            document.getElementById("timeNeededLabel").style.display = "block";
        } else {
            document.getElementById("taskTimeNeeded").style.display = "none";
        }
        modal.style.display = "block";
    }
};

/**
 * Handles the click event for the close button.
 * Closes the currently displayed modal.
 */
closeBtn.onclick = function () {
    modal.style.display = "none";
};

/**
 * Handles the click event outside of the modal.
 * Closes the modal if the click is outside the modal content.
 */
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

/**
 * Handles the click event for the "How to Use" button.
 * Displays the modal with instructions on how to use the system.
 */
howToUseBtn.onclick = function() {
    howToUseModal.style.display = "block";
};

/**
 * Handles the click event for the close button in the "How to Use" modal.
 * Closes the "How to Use" modal.
 */
howToUseCloseBtn.onclick = function () {
    howToUseModal.style.display = "none";
};

/**
 * Handles the submission of the task form, adding a task board or task based on the modal title.
 * @param {Event} event - The form submission event.
 */
taskForm.onsubmit = function (event) {
    event.preventDefault();
    var taskName = taskInput.value.trim();
    if (taskName) {
        if (modalTitle.textContent.startsWith("Add Task Board Item")) {
            for (var taskBoardItemName in taskBoardData) {
                if (taskBoardItemName === taskName) {
                    alert("Error: Task board already exists");
                    modal.style.display = "none";
                    return;
                }
            }
            if (Object.keys(taskBoardData).length >= 10){
                alert("Error: Too many Task Boards currently exist. Delete a board to add a new one");
                    modal.style.display = "none";
                    return;
            }
            addTaskBoardItem(taskName);
        } else if (modalTitle.textContent.startsWith("Add Task for")) {
            var taskTime = document.getElementById("taskTimeNeeded").value.trim();
            if (taskBoardData.hasOwnProperty(currentTaskBoardItem)){
                var tasks = taskBoardData[currentTaskBoardItem];
                if (tasks !== undefined){
                    if (tasks.length >= 10){
                        alert("Error: Too many Task currently exist. Delete a task to add a new one");
                        modal.style.display = "none";
                        return;
                    }
                    for (var i = 0; i < tasks.length; i++){
                        var task = tasks[i];
                        if (task.name === taskName){
                            alert("Error: Task already exists");
                            modal.style.display = "none";
                            return;
                        }
                    }
                }
            }
            addTaskToTaskBoardItem(currentTaskBoardItem, taskName, taskTime);
        }
        modal.style.display = "none";
    }
};

/**
 * Handles the click event for the "Remove Task Board" button.
 * Displays the modal for removing a task board.
 */
btnRemoveTaskBoard.onclick = function() {
    removeTaskBoardModal.style.display = "block";
    populateTaskBoardDropdown(taskBoardData, 'removeBoardSelect');
};

/**
 * Handles the click event for the close button in the "Remove Task Board" modal.
 * Closes the "Remove Task Board" modal.
 */
removeBoardCloseBtn.onclick = function () {
    removeTaskBoardModal.style.display = "none";
};

/**
 * Handles the submission of the form for removing a task board.
 * @param {Event} event - The form submission event.
 */
var removeBoardForm = document.getElementById("removeBoardForm");
removeBoardForm.addEventListener("submit", function(event) {
    event.preventDefault();
    removeTaskBoardModal.style.display = "none";

    let taskBoard = document.getElementById("removeBoardSelect").value;

    const confirmation = confirm(`Are you sure you want to delete the task board "${taskBoard}"? This will delete all associated tasks.`);
    if (confirmation) {
        delete taskBoardData[taskBoard];
        deleteTaskBoardToServer(taskBoard);

        if (taskBoard === currentTaskBoardItem) {
            tasksList.innerHTML = '';
            currentTaskBoardItem = null;
            btnTasks.disabled = true;
            btnRemoveTasks.disabled = true;
            editModalTask.disabled = true;
        }

        renderTaskBoards(taskBoardData);
    }
});

/**
 * Handles the click event for the "Remove Tasks" button.
 * Displays the modal for removing a task.
 */
btnRemoveTasks.onclick = function() {
    removeTasksModal.style.display = "block";
    populateTaskDropdown(taskBoardData, currentTaskBoardItem, 'removeTaskSelect');
};

/**
 * Handles the click event for the close button in the "Remove Tasks" modal.
 * Closes the "Remove Tasks" modal.
 */
removeTaskCloseBtn.onclick = function () {
    removeTasksModal.style.display = "none";
};

/**
 * Deletes an object from a given key in the taskBoardData.
 * @param {object} obj - The task board data object.
 * @param {string} key - The key to search in the object.
 * @param {string} propertyName - The property name to match.
 * @param {string} propertyValue - The property value to match.
 */
function deleteObjectFromKey(obj, key, propertyName, propertyValue) {
    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
        obj[key] = obj[key].filter(item => item[propertyName] !== propertyValue);
    } else {
        console.error(`Key "${key}" does not exist or is not an array.`);
    }
}

/**
 * Handles the submission of the form for removing a task.
 * @param {Event} event - The form submission event.
 */
var removeTaskForm = document.getElementById("removeTaskForm");
removeTaskForm.addEventListener("submit", function(event) {
    event.preventDefault();
    removeTasksModal.style.display = "none";

    let task = document.getElementById("removeTaskSelect").value;

    deleteObjectFromKey(taskBoardData, currentTaskBoardItem, 'name', task);

    renderTasksList(taskBoardData[currentTaskBoardItem]);

    deleteTaskToServer({ board: currentTaskBoardItem, name: task });
});

/**
 * Handles the click event for the "Edit Task" button.
 * Displays the modal for editing a task's time.
 */
editModalTask.onclick = function() {
    editTimeTasksModal.style.display = "block";
    populateTaskDropdown(taskBoardData, currentTaskBoardItem, 'editTaskSelect');
};

/**
 * Handles the click event for the close button in the "Edit Task" modal.
 * Closes the "Edit Task" modal.
 */
editTimeTaskCloseBtn.onclick = function () {
    editTimeTasksModal.style.display = "none";
};

/**
 * Handles the submission of the form for editing a task's time.
 * @param {Event} event - The form submission event.
 */
var editTimeTaskForm = document.getElementById("editTimeForm");

editTimeTaskForm.addEventListener("submit", function(event) {
    event.preventDefault();
    editTimeTasksModal.style.display = "none";

    let task = document.getElementById("editTaskSelect").value;
    let newTime = document.getElementById("editTimeInput").value;

    editTimeValue(taskBoardData, currentTaskBoardItem, 'name', task, newTime);

    renderTasksList(taskBoardData[currentTaskBoardItem]);

    updateTimeToServer({ board: currentTaskBoardItem, name: task, time: newTime });
});

/**
 * Edits the time value of a task in the taskBoardData.
 * @param {object} obj - The task board data object.
 * @param {string} key - The key to search in the object.
 * @param {string} propertyName - The property name to match.
 * @param {string} propertyValue - The property value to match.
 * @param {string} newTime - The new time value to set.
 */
function editTimeValue(obj, key, propertyName, propertyValue, newTime) {

    if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {

        let item = obj[key].find(item => item[propertyName] === propertyValue);

        if (item) {
            item.time = newTime;
        } else {
            console.error(`Object with ${propertyName} "${propertyValue}" not found in key "${key}".`);
        }
    } else {
        console.error(`Key "${key}" does not exist or is not an array.`);
    }
}

/**
 * Adds a new task board item to the task board list and updates the taskBoardData.
 * @param {string} taskBoardItemName - The name of the new task board item.
 */
function addTaskBoardItem(taskBoardItemName) {
    var listItem = document.createElement("li");
    listItem.textContent = taskBoardItemName;
    listItem.onclick = function () {
        selectTaskBoardItem(taskBoardItemName, listItem);
    };
    taskBoardList.appendChild(listItem);
    taskBoardData[taskBoardItemName] = [];


    sendTaskToServer({ type: 'taskBoardItem', name: taskBoardItemName });
}

/**
 * Adds a task board item to the task board list.
 * @param {string} taskBoardItemName - The name of the task board item.
 */
function addTaskBoardItemToList(taskBoardItemName) {
    var listItem = document.createElement("li");
    listItem.textContent = taskBoardItemName;
    listItem.onclick = function () {
        selectTaskBoardItem(taskBoardItemName, listItem);
    };
    taskBoardList.appendChild(listItem);
}

/**
 * Adds a task to a task board item and updates the taskBoardData.
 * @param {string} taskBoardItemName - The name of the task board item.
 * @param {string} taskName - The name of the task.
 * @param {string} taskTime - The time needed for the task.
 */
function addTaskToTaskBoardItem(taskBoardItemName, taskName, taskTime) {
    taskBoardData[taskBoardItemName].push({ name: taskName, time: taskTime });
    if (taskBoardItemName === currentTaskBoardItem) {
        renderTasksList(taskBoardData[taskBoardItemName]);
    }

    sendTaskToServer({
        type: 'task',
        taskBoardItem: taskBoardItemName,
        name: taskName,
        time: taskTime
    });
}

/**
 * Selects a task board item, enabling task-related buttons and rendering the tasks list.
 * @param {string} taskBoardItemName - The name of the task board item.
 * @param {HTMLElement} listItem - The list item element.
 */
function selectTaskBoardItem(taskBoardItemName, listItem) {
    currentTaskBoardItem = taskBoardItemName;
    btnTasks.disabled = false;
    btnRemoveTasks.disabled = false;
    editModalTask.disabled = false;
    renderTasksList(taskBoardData[taskBoardItemName]);
    highlightSelectedItem(listItem);
}

/**
 * Renders the tasks list for the selected task board item.
 * @param {array} tasks - The list of tasks.
 */
function renderTasksList(tasks) {
    tasksList.innerHTML = "";
    tasks.forEach(function (task) {
        var listItem = document.createElement("li");
        var taskLabel = document.createElement("span");
        var taskTime = document.createElement("span");

        taskLabel.textContent = task.name;
        taskTime.textContent = "\t|\t" + task.time + " minutes remaining";

        listItem.appendChild(taskLabel);
        listItem.appendChild(taskTime);

        tasksList.appendChild(listItem);
    });
}

/**
 * Renders the tasks list for a specific task board item.
 * @param {string} taskBoardItemName - The name of the task board item.
 * @param {array} tasks - The list of tasks.
 */
function renderTasksListForBoardItem(taskBoardItemName, tasks) {
    var escapedTaskBoardItemName = taskBoardItemName.replace("'", "\\'");
    var boardItem = document.querySelector(`li[data-name='${escapedTaskBoardItemName}']`);
    if (boardItem) {
        var taskList = document.createElement('ul');
        tasks.forEach(function (task) {
            var listItem = document.createElement("li");
            listItem.textContent = task;
            taskList.appendChild(listItem);
        });
        boardItem.appendChild(taskList);
    }
}

/**
 * Highlights the selected item in the task board list.
 * @param {HTMLElement} selectedItem - The selected list item element.
 */
function highlightSelectedItem(selectedItem) {
    var items = taskBoardList.getElementsByTagName("li");
    for (var i = 0; i < items.length; i++) {
        items[i].classList.remove("selected");
    }
    selectedItem.classList.add("selected");
}

/**
 * Sends task data to the server.
 * @param {object} data - The task data to send.
 */
function sendTaskToServer(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/add-task", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Task added successfully!");
        }
    };
    xhr.send(JSON.stringify(data));
}

/**
 * Sends request to delete a task board to the server.
 * @param {object} data - The task board data to delete.
 */
function deleteTaskBoardToServer(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/del-task-board", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Task board removed successfully!");
        }
    };
    xhr.send(JSON.stringify(data));
}

/**
 * Sends request to delete a task to the server.
 * @param {object} data - The task data to delete.
 */
function deleteTaskToServer(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/del-task", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Task removed successfully!");
        }
    };
    xhr.send(JSON.stringify(data));
}

/**
 * Sends request to update task time to the server.
 * @param {object} data - The task time data to update.
 */
function updateTimeToServer(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/update-time", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Time updated successfully!");
        }
    };
    xhr.send(JSON.stringify(data));
}

/**
 * Sends feedback to the server.
 * @param {object} data - The feedback data to submit.
 */
function submitFeedbackToServer(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/submit-feedback", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            console.log("Feedback submitted successfully!");
        }
    };
    xhr.send(JSON.stringify(data));
}

/**
 * Handles the click event for the "Logs" button.
 * Redirects to the logs page.
 */
var logsButton = document.getElementById("logs-button");

logsButton.onclick = function() {
    window.location.href = '/logs';
};

/**
 * Updates the task time for a given task in the taskBoardData.
 * @param {string} taskBoard - The task board name.
 * @param {string} taskName - The task name.
 * @param {number} sub_time - The time to subtract from the task.
 * @returns {number} - The updated task time.
 */
function updateTaskTime(taskBoard, taskName, sub_time) {
    const tasks = taskBoardData[taskBoard];
    var new_time = 0;
    if (tasks) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].name === taskName) {
                new_time = tasks[i].time - sub_time;
                if (new_time < 0){
                    tasks[i].time = 0;
                    return tasks[i].time;
                } else {
                    tasks[i].time = new_time;
                    return tasks[i].time;
                }
            }
        }
    }
}
