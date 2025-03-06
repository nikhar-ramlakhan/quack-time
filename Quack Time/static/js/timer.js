/**
 * This JavaScript file handles the functionality for the timer system.
 * It includes modal management, form submission, timer control, and requests.
 */

// Modal elements
var setTimeModal = document.getElementById("setTimeModal");
var setTimeBtn = document.getElementById("setTimeButton");
var pomoTimeBtn = document.getElementById("setPomodoro");
var setBreakBtn = document.getElementById("setBreak");
var closeFormBtn = document.getElementsByClassName("close")[0];
var setProductivityModal = document.getElementById("feedbackModal");
var prodCloseBtn = document.getElementsByClassName("close")[1];

// Timer control elements
var startButton = document.getElementById("startButton");
var stopButton = document.getElementById("stopButton");
var timeInput = document.getElementById("timeInput");
var timer = document.getElementById("timer");
var intervalId;
var setTime;
var isBreak = false;

/**
 * Event handler for setting custom time.
 * Stops the timer, sets the break flag to false, and displays the set time modal.
 */
setTimeBtn.onclick = function() {
    stopTimer();
    isBreak = false;
    setTimeModal.style.display = "block";
};

/**
 * Event handler for setting Pomodoro time (25 minutes).
 * Stops the timer, sets the time to 25:00, updates the timer display, and stores the set time.
 */
pomoTimeBtn.onclick = function() {
    stopTimer();
    var timeVal = "25:00";
    isBreak = false;
    timer.innerText = timeVal;
    setTime = timeVal;
    console.log("Set time:", setTime);
};

/**
 * Event handler for setting break time (5 minutes).
 * Stops the timer, sets the time to 5:00, updates the timer display, and stores the set time.
 */
setBreakBtn.onclick = function() {
    stopTimer();
    var timeVal = "5:00";
    isBreak = true;
    timer.innerText = timeVal;
    setTime = timeVal;
};

/**
 * Event handler for closing the set time modal.
 */
closeFormBtn.onclick = function() {
    setTimeModal.style.display = "none";
};

/**
 * Event handler for closing the productivity feedback modal.
 */
prodCloseBtn.onclick = function() {
    setProductivityModal.style.display = "none";
};

/**
 * Event handler for closing modals when clicking outside of them.
 * @param {Event} event - The click event.
 */
window.onclick = function(event) {
    if (event.target == setTimeModal) {
        setTimeModal.style.display = "none";
    }
};

var setTimeForm = document.getElementById("setTimeForm");
var setFeedbackForm = document.getElementById("setFeedbackForm");

/**
 * Event handler for submitting the set time form.
 * Updates the timer display and stores the set time.
 * @param {Event} event - The form submission event.
 */
setTimeForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var timeVal = timeInput.value;
    timeVal = timeVal + ":00";

    timer.innerText = timeVal;
    setTime = timeVal;
    console.log("Set time:", setTime);

    setTimeModal.style.display = "none";
});

/**
 * Event handler for submitting the productivity feedback form.
 * Submits the feedback, updates the task time, and renders the updated task list.
 * @param {Event} event - The form submission event.
 */
setFeedbackForm.addEventListener("submit", function(event) {
    event.preventDefault();
    setProductivityModal.style.display = "none";

    var taskBoard = document.getElementById("taskBoardSelect").value;
    var task = document.getElementById("taskSelect").value;
    var productivityRating = document.getElementById("feedbackInput").value;

    console.log("Feedback submitted with set time:", setTime);
    console.log("Productivity rating:", productivityRating);

    let sub_time = calculateSubtractTime(setTime, productivityRating);
    let new_time = updateTaskTime(taskBoard, task, sub_time);
    const tasks = taskBoardData[taskBoard];
    renderTasksList(tasks);

    submitFeedbackToServer({ taskBoard: taskBoard, task: task, timer: setTime, newTime: new_time, rating: productivityRating });
});

/**
 * Event handler for starting the timer.
 */
startButton.addEventListener("click", function() {
    startTimer(timer.innerText);
});

/**
 * Event handler for stopping the timer.
 */
stopButton.addEventListener("click", function() {
    stopTimer();
});

/**
 * Starts the timer with the specified time.
 * @param {string} time - The initial time for the timer.
 */
function startTimer(time) {
    clearInterval(intervalId);
    var timeParts = time.split(":");
    var minutes = parseInt(timeParts[0]);
    var seconds = parseInt(timeParts[1]);
    var totalTime = (minutes * 60 + seconds) * 1000;

    setTime = totalTime;

    if (totalTime <= 0) {
        return;
    }
    intervalId = setInterval(function() {
        // Decrement seconds
        seconds--;
        if (seconds < 0) {
            minutes--;
            seconds = 59;
        }


        var formattedTime = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        timer.innerText = formattedTime;


        if (minutes <= 0 && seconds <= 0) {
            clearInterval(intervalId); // stop the interval
            document.getElementById("taskBoardSelect").selectedIndex = 0;
            document.getElementById("taskSelect").selectedIndex = 0;
            document.getElementById("feedbackInput").value = '';

            if (!isBreak) {
                setProductivityModal.style.display = "block";
                populateTaskBoardDropdown(taskBoardData, 'taskBoardSelect');
            }

            isBreak = false;
        }
    }, 1000);
}

/**
 * Stops the timer.
 */
function stopTimer() {
    clearInterval(intervalId);
}

/**
 * Populates the task board dropdown with the available task boards.
 * @param {object} options - The task board data.
 * @param {string} elementId - The ID of the dropdown element.
 */
function populateTaskBoardDropdown(options, elementId) {
    const keys = Object.keys(options);
    const selectElement = document.getElementById(elementId);
    selectElement.innerHTML = '';

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Task Board...';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectElement.appendChild(placeholderOption);

    keys.forEach(key => {
        const optionElement = document.createElement('option');
        optionElement.value = key;
        optionElement.textContent = key;
        selectElement.appendChild(optionElement);
    });
}

/**
 * Populates the task dropdown with the available tasks for the selected task board.
 * @param {object} options - The task board data.
 * @param {string} taskKey - The key of the selected task board.
 * @param {string} elementId - The ID of the dropdown element.
 */
function populateTaskDropdown(options, taskKey, elementId) {
    const selectElement = document.getElementById(elementId);
    if (selectElement != null) {
        selectElement.innerHTML = '';
    }
    const values = options[taskKey];

    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = 'Select a Task...';
    placeholderOption.disabled = true;
    placeholderOption.selected = true;
    selectElement.appendChild(placeholderOption);

    if (Array.isArray(values)) {
        values.forEach(item => {
            const optionElement = document.createElement('option');
            optionElement.value = item.name;
            optionElement.textContent = item.name;
            selectElement.appendChild(optionElement);
        });
    }
}

/**
 * Event handler for updating the task dropdown when the task board selection changes.
 */
const selectElement = document.getElementById('taskBoardSelect');
selectElement.addEventListener('change', function(event) {
    const selectedValue = event.target.value;
    populateTaskDropdown(taskBoardData, selectedValue, 'taskSelect');
});

/**
 * Calculates the time to subtract from the total time based on the productivity rating.
 * @param {number} totalTime - The total time in milliseconds.
 * @param {string} rate - The productivity rating.
 * @returns {number} - The time to subtract in minutes.
 */
function calculateSubtractTime(totalTime, rate) {
    let subtractTime;

    totalTime = totalTime / 60000;

    switch(rate) {
        case "1":
            subtractTime = totalTime * 0.2;
            break;
        case "2":
            subtractTime = totalTime * 0.4;
            break;
        case "3":
            subtractTime = totalTime * 0.6;
            break;
        case "4":
            subtractTime = totalTime * 0.8;
            break;
        default:
            subtractTime = totalTime;
    }

    return Math.round(subtractTime);
}
