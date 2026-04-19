/* --- GLOBAL VARIABLES --- */
const themeBtn = document.getElementById('theme-toggle');

/* --- THEME LOGIC --- */
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

if (themeBtn) {
    themeBtn.onclick = () => {
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isCurrentlyDark ? 'light' : 'dark');
        applyTheme();
    };
}
async function toggleTaskStatus(taskId) {
    showToast("Updating task...");
    const res = await apiRequest({ 
        action: 'updateTaskStatus', 
        taskId: taskId 
    });
    
    if (res.success) {
        loadTasks(); // Refresh the list to show the checkmark/strikethrough
    } else {
        showToast("Update failed", "error");
    }
}
/* --- MODAL LOGIC --- */
function openListModal() {
    const modal = document.getElementById('list-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeListModal() {
    const modal = document.getElementById('list-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('list-modal-form').reset();
    }
}

// --- NEW: WEB-MODE CONFIRMATION BOX ---
function customConfirm(title, msg, icon, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-msg').innerText = msg;
    document.getElementById('confirm-icon').innerHTML = icon; // e.g., "❓" or "⚠️"
    
    modal.classList.remove('hidden');

    // Cancel button
    document.getElementById('confirm-cancel').onclick = () => modal.classList.add('hidden');

    // Proceed button
    document.getElementById('confirm-proceed').onclick = () => {
        modal.classList.add('hidden');
        onConfirm();
    };
}

// Updated Logout
function confirmLogout() {
    customConfirm("Logging Out", "Are you sure you want to end your session?", "🚪", () => {
        localStorage.removeItem('todo_user');
        window.location.reload();
    });
}

document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // This object matches your 6 Tasks columns
    const payload = {
        action: 'addTask',
        listId: currentListId, 
        text: document.getElementById('task-input').value,
        status: 'Pending', // Default status for new tasks
        dueDate: document.getElementById('task-date').value,
        dueTime: document.getElementById('task-time').value
    };

    showToast("Saving task...");
    
    const res = await apiRequest(payload);
    if (res.success) {
        showToast("Task Added!");
        document.getElementById('task-form').reset();
        loadTasks(); // Refresh the UI list
    } else {
        showToast("Error saving task", "error");
    }
};
async function loadLists() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    if (!user) return;

    // 1. Get container from HTML
    const container = document.getElementById('lists-container');
    if (!container) return;

    // 2. Fetch from Apps Script
    const res = await apiRequest({ action: 'getLists', userId: user.id });
    
    container.innerHTML = ""; // Clear current view

    if (res.success && res.data && res.data.length > 0) {
        res.data.forEach(list => {
            const div = document.createElement('div');
            div.className = "group flex items-center justify-between p-4 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-transparent hover:border-indigo-500 cursor-pointer transition-all";
            
            // This builds the HTML for each list card
            div.innerHTML = `
                <div>
                    <h4 class="font-bold text-slate-800 dark:text-white">${list.list_title}</h4>
                    <p class="text-xs text-slate-500">${list.description || 'No description'}</p>
                </div>
                <i class="fas fa-chevron-right text-slate-300 group-hover:text-indigo-500"></i>
            `;
            
            // When clicked, show this list's tasks
            div.onclick = () => selectList(list.list_id, list.list_title);
            container.appendChild(div);
        });
    } else {
        container.innerHTML = `<p class="text-center text-slate-400 py-10">No collections found. Click + to start!</p>`;
    }
}
async function loadTasks() {
    if (!currentActiveListId) return;

    const container = document.getElementById('tasks-container');
    if (!container) return;

    // Show a loading state
    container.innerHTML = `<p class="text-center text-slate-400">Loading tasks...</p>`;

    try {
        const res = await apiRequest({ 
            action: 'getTasks', 
            listId: currentActiveListId 
        });

        container.innerHTML = ""; // Clear loading text

        if (res.success && res.data && res.data.length > 0) {
            res.data.forEach(task => {
                const item = document.createElement('div');
                item.className = "flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl mb-2 shadow-sm border border-transparent hover:border-indigo-500 transition-all";
                item.innerHTML = `
                    <input type="checkbox" ${task.status === 'Completed' ? 'checked' : ''} 
                           onchange="toggleTaskStatus('${task.task_id}')" 
                           class="w-5 h-5 rounded border-slate-300 accent-indigo-600">
                    <div class="flex-1">
                        <p class="${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-white font-medium'}">${task.task_text}</p>
                        <div class="flex gap-3 mt-1">
                            <span class="text-[10px] text-slate-400"><i class="far fa-calendar-alt mr-1"></i>${task.due_date || 'No Date'}</span>
                            <span class="text-[10px] text-slate-400"><i class="far fa-clock mr-1"></i>${task.due_time || 'No Time'}</span>
                        </div>
                    </div>
                `;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = `<p class="text-center text-slate-400 py-10">No tasks in this collection yet. Add one above!</p>`;
        }
    } catch (err) {
        console.error("Failed to load tasks:", err);
        container.innerHTML = `<p class="text-center text-red-500 py-10">Error loading tasks.</p>`;
    }
}
// 1. First, define this variable at the very top of app.js (outside any functions)
let currentActiveListId = null;

// 2. Add the selectList function below
async function selectList(id, title) {
    console.log("Switching to list:", id); // Helpful for debugging
    currentActiveListId = id;
    
    // Update the Header Title
    const titleElement = document.getElementById('active-list-title');
    if (titleElement) {
        titleElement.innerText = title;
    }
    
    // Reveal the Task Input form
    const inputSection = document.getElementById('task-input-section');
    if (inputSection) {
        inputSection.classList.remove('hidden');
    }
    
    // Fetch and show the tasks for this specific list
    if (typeof loadTasks === "function") {
        loadTasks();
    } else {
        console.error("loadTasks function is missing!");
    }
}
/* --- TOAST LOGIC --- */
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerText = msg;
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;
    toast.style.transform = 'translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateY(100px)'; }, 3000);
}

// Start theme
applyTheme();
