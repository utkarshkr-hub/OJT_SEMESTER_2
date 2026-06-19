/**
 * Kanban Task Board Script File
 * Manages UI State Data Mutation, Event Hooks and Browser LocalStorage Syncing
 */

// --- Centralized Application State ---
let boardState = {
    todo: [],
    inprogress: [],
    done: []
};

// --- DOM Cache References ---
const themeToggle = document.getElementById('theme-toggle');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const clearBoardBtn = document.getElementById('clear-board-btn');
const containers = document.querySelectorAll('.tasks-container');

// --- Initialization Hook ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    loadBoardData();
    setupDragAndDropEvents();
});

// --- Theme Implementation Management ---
function initializeTheme() {
    const savedTheme = localStorage.getItem('kanban-theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', targetTheme);
        localStorage.setItem('kanban-theme', targetTheme);
        updateThemeIcon(targetTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// --- Data Management & LocalStorage CRUD ---
function saveBoardData() {
    localStorage.setItem('kanban-board-state', JSON.stringify(boardState));
    updateCounters();
}

function loadBoardData() {
    const rawData = localStorage.getItem('kanban-board-state');
    if (rawData) {
        boardState = JSON.parse(rawData);
    } else {
        // Factory Default tasks for first-time visitors
        boardState = {
            todo: [{ id: 't1', text: 'Create project specifications documentation' }],
            inprogress: [{ id: 't2', text: 'Refactor UI styles for responsiveness' }],
            done: [{ id: 't3', text: 'Integrate custom CSS layout templates' }]
        };
    }
    
    // Render columns from current app state
    Object.keys(boardState).forEach(status => {
        const targetColumn = document.getElementById(status);
        targetColumn.innerHTML = ''; // Reset container list space
        boardState[status].forEach(task => {
            const cardElement = createTaskCardElement(task.id, task.text);
            targetColumn.appendChild(cardElement);
        });
    });
    updateCounters();
}

// --- Dynamic Component Creation Factory ---
function createTaskCardElement(id, text) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', id);

    card.innerHTML = `
        <div class="task-text" spellcheck="false">${text}</div>
        <div class="card-actions">
            <button class="action-btn edit" title="Edit task content"><i class="fas fa-pen"></i></button>
            <button class="action-btn delete" title="Delete task permanently"><i class="fas fa-trash"></i></button>
        </div>
    `;

    // Hook card dynamic element functional operations
    attachCardActionListeners(card);
    return card;
}

// --- Card Internal Event Processing ---
function attachCardActionListeners(card) {
    const textElement = card.querySelector('.task-text');
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');
    const cardId = card.getAttribute('data-id');

    // Drag tracking markers hooks
    card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', cardId);
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    // Inline Edit Content Mode Trigger
    editBtn.addEventListener('click', () => {
        const isEditing = textElement.getAttribute('contenteditable') === 'true';
        if (!isEditing) {
            // Switch to edit phase
            textElement.setAttribute('contenteditable', 'true');
            textElement.focus();
            editBtn.innerHTML = '<i class="fas fa-check"></i>';
            editBtn.className = 'action-btn save';
        } else {
            // Confirm/Save phase
            saveCardTextMutation(cardId, textElement.textContent.trim());
            textElement.setAttribute('contenteditable', 'false');
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.className = 'action-btn edit';
        }
    });

    // Inline Card Delete Execution
    deleteBtn.addEventListener('click', () => {
        removeTaskFromState(cardId);
        card.remove();
        saveBoardData();
    });
}

// --- Form Formats Processing Operations ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const newTask = {
        id: 'task_' + Date.now(), // Generate semi-unique identifiers using timestamp metrics
        text: taskText
    };

    // New items default to the 'todo' sequence path
    boardState.todo.push(newTask);
    
    const cardElement = createTaskCardElement(newTask.id, newTask.text);
    document.getElementById('todo').appendChild(cardElement);
    
    saveBoardData();
    taskInput.value = ''; // Flush input field area clean
});

// --- State Mutation Support Operations ---
function saveCardTextMutation(id, updatedText) {
    Object.keys(boardState).forEach(columnKey => {
        const index = boardState[columnKey].findIndex(t => t.id === id);
        if (index !== -1) {
            boardState[columnKey][index].text = updatedText;
        }
    });
    saveBoardData();
}

function removeTaskFromState(id) {
    Object.keys(boardState).forEach(columnKey => {
        boardState[columnKey] = boardState[columnKey].filter(t => t.id !== id);
    });
}

function updateCounters() {

    Object.keys(boardState).forEach(columnKey => {
        document.getElementById(
            `count-${columnKey}`
        ).textContent =
            boardState[columnKey].length;
    });

    updateAnalytics();
}``

function updateAnalytics() {

    const todoCount = boardState.todo.length;
    const progressCount = boardState.inprogress.length;
    const doneCount = boardState.done.length;

    const totalTasks =
        todoCount +
        progressCount +
        doneCount;

    const completionPercentage =
        totalTasks === 0
            ? 0
            : Math.round((doneCount / totalTasks) * 100);

    document.getElementById('totalTasks').textContent =
        totalTasks;

    document.getElementById('todoTasks').textContent =
        todoCount;

    document.getElementById('progressTasks').textContent =
        progressCount;

    document.getElementById('doneTasks').textContent =
        doneCount;

    document.getElementById('progressPercentage').textContent =
        completionPercentage + '%';

    document.getElementById('progressBar').style.width =
        completionPercentage + '%';
}

// --- Native HTML5 Drag and Drop Handlers ---
function setupDragAndDropEvents() {
    containers.forEach(container => {
        
        container.addEventListener('dragover', (e) => {
            // Essential override instruction to accept placement drops inside target nodes
            e.preventDefault(); 
            container.classList.add('drag-over');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            const targetTaskId = e.dataTransfer.getData('text/plain');
            const movingCardElement = document.querySelector(`[data-id="${targetTaskId}"]`);
            if (!movingCardElement) return;

            const targetColumnId = container.id; // Options: 'todo', 'inprogress', 'done'
            
            // Locate original source array and content profile parameters
            let foundTaskObj = null;
            Object.keys(boardState).forEach(columnKey => {
                const targetIdx = boardState[columnKey].findIndex(t => t.id === targetTaskId);
                if (targetIdx !== -1) {
                    foundTaskObj = boardState[columnKey].splice(targetIdx, 1)[0];
                }
            });

            if (foundTaskObj) {
                // Insert into target data storage mapping
                boardState[targetColumnId].push(foundTaskObj);
                
                // Visual node relocation execution insertion
                container.appendChild(movingCardElement);
                
                // Synchronize state data structure configuration modifications
                saveBoardData();
            }
        });
    });
}

// --- Purge Board Action ---
clearBoardBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all tasks across this board?')) {
        boardState = { todo: [], inprogress: [], done: [] };
        Object.keys(boardState).forEach(status => {
            document.getElementById(status).innerHTML = '';
        });
        saveBoardData();
    }
});