// State Management
let tasks = JSON.parse(localStorage.getItem('ca_tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const progressPercentage = document.getElementById('progress-percentage');
const emptyState = document.getElementById('empty-state');
const emptyMessage = document.getElementById('empty-message');
const appContainer = document.querySelector('.app-container');

// Initial Load Animation
document.addEventListener('DOMContentLoaded', () => {
    render();
    setTimeout(() => {
        appContainer.classList.add('visible');
    }, 100);
});

// --- Core Functions ---

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const newTask = {
        id: Date.now(),
        text: text,
        done: false,
        createdAt: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        })
    };

    tasks.unshift(newTask);
    taskInput.value = '';
    saveTasks();
    render();
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (taskElement) {
        taskElement.classList.add('removing');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            render();
        }, 300);
    } else {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        render();
    }
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    saveTasks();
    render();
}

function updateTask(id, newText) {
    const trimmedText = newText.trim();
    if (trimmedText) {
        tasks = tasks.map(t => t.id === id ? { ...t, text: trimmedText } : t);
    }
    saveTasks();
    render();
}

function saveTasks() {
    localStorage.setItem('ca_tasks', JSON.stringify(tasks));
    updateProgress();
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    progressText.innerText = `${completed} / ${total} done`;
    progressPercentage.innerText = `${percentage}%`;
    progressFill.style.width = `${percentage}%`;
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- Render Logic ---

function render() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.done;
        if (currentFilter === 'done') return task.done;
        return true;
    });

    // Handle Empty State
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        if (currentFilter === 'active') {
            emptyMessage.innerText = "No active tasks. You're all caught up!";
        } else if (currentFilter === 'done') {
            emptyMessage.innerText = "No completed tasks yet.";
        } else {
            emptyMessage.innerText = "Nothing here yet. Add your first task above.";
        }
    } else {
        emptyState.classList.add('hidden');
        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} 
                    onclick="toggleTask(${task.id})">
                
                <div class="task-text-wrapper" id="content-${task.id}">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="task-date">${task.createdAt}</span>
                </div>

                <div class="task-actions">
                    <button class="action-btn edit" onclick="enterEditMode(${task.id})" aria-label="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteTask(${task.id})" aria-label="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </li>
        `).join('');
    }

    updateProgress();
}

// --- Interaction Helpers ---

function enterEditMode(id) {
    const task = tasks.find(t => t.id === id);
    const contentWrapper = document.getElementById(`content-${id}`);
    const originalContent = contentWrapper.innerHTML;

    contentWrapper.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHTML(task.text)}" maxlength="120" id="edit-input-${id}">
    `;

    const input = document.getElementById(`edit-input-${id}`);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    const handleSave = () => {
        updateTask(id, input.value);
    };

    const handleCancel = () => {
        render(); // Just re-render to discard changes
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') handleCancel();
    });

    // Save on blur if not cancelled by escape
    input.addEventListener('blur', (e) => {
        // Short delay to allow clicking a save button if we had one, 
        // but here we just save on blur or enter.
        handleSave();
    });
}

// --- Event Listeners ---

addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        render();
    });
});
