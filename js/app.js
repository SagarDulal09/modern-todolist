/* APP.JS - The Core Dashboard Logic
   Handles: Dark Mode, Lists, Tasks, and Status Updates
*/

// 1. GLOBAL STATE & THEME
// Initialize Theme on Load
const themeBtn = document.getElementById('theme-toggle');

// --- THEME TOGGLE LOGIC ---
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Toggle Function
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.onclick = () => {
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isCurrentlyDark ? 'light' : 'dark');
        applyTheme();
    };
}

// --- MODAL CONTROLS ---
function openListModal() {
    const modal = document.getElementById('list-modal');
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error("Error: list-modal element not found in HTML.");
    }
}

function closeListModal() {
    const modal = document.getElementById('list-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('list-modal-form').reset();
    }
}

// --- LOGOUT WITH CONFIRMATION ---
function confirmLogout() {
    const confirmAction = confirm("Are you sure you want to log out?");
    if (confirmAction) {
        localStorage.removeItem('todo_user');
        window.location.reload(); // Refresh to show login screen
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', applyTheme);

// Run immediately
applyTheme();

// Initialize App on Load
function initApp() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    if (!user) return;

    // Apply Saved Theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        if(themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    loadLists(); // Fetch your collections from Google Sheets
}

// Dark Mode Toggle
if (themeBtn) {
    themeBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };
}

// 2. LIST / COLLECTION MANAGEMENT
async function loadLists() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const container = document.getElementById('list-container');
    container.innerHTML = '<p class="text-xs p-2">Loading...</p>';

    const res = await apiRequest({ action: 'getLists', userId: user.id });
    container.innerHTML = '';

    if (res.success && res.lists.length > 0) {
        res.lists.forEach(list => {
            const li = document.createElement('li');
            li.className = "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 transition group";
            li.innerHTML = `
                <span onclick="selectList('${list.id}', '${list.title}')" class="flex-1 font-medium text-sm">${list.title}</span>
                <button onclick="deleteList('${list.id}')" class="opacity-0 group-hover:opacity-100 text-red-400 p-1"><i class="fas fa-times text-xs"></i></button>
            `;
            container.appendChild(li);
        });
    } else {
        container.innerHTML = '<p class="text-xs text-slate-400 p-2">No lists created.</p>';
    }
}

// MODAL CONTROLS
function openListModal() {
    document.getElementById('list-modal').classList.remove('hidden');
}

function closeListModal() {
    document.getElementById('list-modal').classList.add('hidden');
    document.getElementById('list-modal-form').reset();
}

// HANDLE MODAL SUBMISSION
document.getElementById('list-modal-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('todo_user'));
    
    // Extracting values from your new Modal fields
    const payload = {
        action: 'addList',
        userId: user.id,
        title: document.getElementById('modal-list-title').value,
        description: document.getElementById('modal-list-desc').value,
        startDate: document.getElementById('modal-start-date').value,
        endDate: document.getElementById('modal-end-date').value,
        startTime: document.getElementById('modal-start-time').value,
        endTime: document.getElementById('modal-end-time').value
    };

    showToast("Creating collection...");
    try {
        const res = await apiRequest(payload);
        if (res.success) {
            showToast("List Created!");
            closeListModal(); // Hide the modal
            loadLists();      // Refresh the sidebar
        } else {
            showToast("Error: " + res.error, "error");
        }
    } catch (err) {
        showToast("Request failed", "error");
    }
};

   
};

// Update your sidebar button in HTML to: 
// <button onclick="openListModal()"> ... </button>

// 3. TASK MANAGEMENT
let currentListId = null;

function selectList(id, title) {
    currentListId = id;
    document.getElementById('active-list-title').innerText = title;
    document.getElementById('task-form').classList.remove('hidden');
    document.getElementById('empty-state').classList.add('hidden');
    loadTasks();
}

async function loadTasks() {
    const container = document.getElementById('task-container');
    container.innerHTML = '<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-indigo-500"></i></div>';

    const res = await apiRequest({ action: 'getTasks', listId: currentListId });
    container.innerHTML = '';

    if (res.success && res.tasks.length > 0) {
        res.tasks.forEach(task => renderTask(task));
    } else {
        document.getElementById('empty-state').classList.remove('hidden');
    }
}

// Handle Task Form Submission
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    const text = document.getElementById('task-input').value;
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;

    

    if (res.success) {
        document.getElementById('task-form').reset();
        loadTasks();
    }
};

// 4. THE TASK RENDERER (With Status & Due Dates)
function renderTask(task) {
    const container = document.getElementById('task-container');
    const li = document.createElement('li');
    li.className = "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2 shadow-sm";
    
    // Status color logic
    const statusStyles = {
        'Pending': 'bg-amber-100 text-amber-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Completed': 'bg-green-100 text-green-700'
    };

    li.innerHTML = `
        <div class="flex justify-between items-center">
            <span class="font-bold ${task.status === 'Completed' ? 'line-through opacity-50' : ''}">${task.text}</span>
            <select onchange="updateTaskStatus('${task.id}', this.value)" class="text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none ${statusStyles[task.status]}">
                <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
        </div>
        <div class="flex gap-4 text-[10px] text-slate-400 font-medium">
            <span><i class="far fa-calendar-alt"></i> ${task.dueDate || 'No Date'}</span>
            <span><i class="far fa-clock"></i> ${task.dueTime || 'No Time'}</span>
            <button onclick="deleteTask('${task.id}')" class="ml-auto text-red-400 hover:text-red-600 transition"><i class="fas fa-trash"></i></button>
        </div>
    `;
    container.appendChild(li);
}

async function updateTaskStatus(taskId, newStatus) {
    showToast("Updating status...");
    const res = await apiRequest({ action: 'updateTask', taskId: taskId, status: newStatus });
    if(res.success) loadTasks();
}

async function deleteTask(taskId) {
    if(!confirm("Delete this task?")) return;
    showToast("Deleting...");
    const res = await apiRequest({ action: 'deleteTask', taskId: taskId });
    if(res.success) loadTasks();
}

// Helper: Toast Notifications
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;
    toast.style.transform = 'translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateY(100px)'; }, 3000);
}
showToast("Saving task...");
    const res = await apiRequest({
        action: 'addTask',
        listId: currentListId,
        text: text,
        status: 'Pending',
        dueDate: date,
        dueTime: time
    });

// Start everything
initApp();
// Add this to the very bottom of js/app.js
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return; // Safety check
    
    toast.innerText = msg;
    // Reset classes
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;
    
    // Slide In
    toast.style.transform = 'translateY(0)';
    
    // Slide Out after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
    }, 3000);
}
