/* ============================================================
   1. GLOBAL STATE & INITIALIZATION
   ============================================================ */
let currentActiveListId = null;

// Initialize the app logic
function initApp() {
    console.log("TaskFlow Initialized");
    applyTheme();
    loadLists();
}

/* ============================================================
   2. LIST / COLLECTION MANAGEMENT
   ============================================================ */

// Fetch all lists for the logged-in user from the database
async function loadLists() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const container = document.getElementById('lists-container');
    
    if (!user || !container) return;

    const res = await apiRequest({ action: 'getLists', userId: user.id });
    container.innerHTML = ""; // Clear current sidebar

    if (res.success && res.data && res.data.length > 0) {
        res.data.forEach(list => {
            const div = document.createElement('div');
            div.className = "group flex items-center justify-between p-4 mb-2 bg-white dark:bg-slate-800 rounded-2xl cursor-pointer border border-transparent hover:border-indigo-500 shadow-sm transition-all";
            
            div.innerHTML = `
                <div class="overflow-hidden">
                    <h4 class="font-bold text-sm truncate dark:text-white">${list.list_title}</h4>
                    <p class="text-[10px] text-slate-400 truncate">${list.description || 'No description'}</p>
                </div>
                <i class="fas fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"></i>
            `;
            
            // Set the click event to load this list's tasks
            div.onclick = () => selectList(list.list_id, list.list_title);
            container.appendChild(div);
        });
    } else {
        container.innerHTML = `<p class="text-[10px] text-slate-400 text-center py-6">No collections found.</p>`;
    }
}

// When a user clicks a collection in the sidebar
async function selectList(id, title) {
    currentActiveListId = id;
    
    // UI: Update Title and show the hidden task input form
    const titleHeader = document.getElementById('active-list-title');
    const inputSection = document.getElementById('task-input-section');
    
    if (titleHeader) titleHeader.innerText = title;
    if (inputSection) inputSection.classList.remove('hidden');
    
    // Fetch and render tasks for this list
    loadTasks();
}

// Handle the "New Collection" Modal Submission
document.getElementById('list-modal-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('todo_user'));

    const payload = {
        action: 'addList',
        userId: user.id,
        title: document.getElementById('modal-list-title').value,
        description: document.getElementById('modal-list-desc').value,
        startDate: document.getElementById('modal-start-date').value,
        endDate: document.getElementById('modal-end-date').value
    };

    showToast("Creating collection...");
    const res = await apiRequest(payload);
    
    if (res.success) {
        closeListModal();
        loadLists(); // Refresh sidebar
        showToast("Success! Collection added.");
    } else {
        showToast("Error creating collection", "error");
    }
};

/* ============================================================
   3. TASK MANAGEMENT
   ============================================================ */

// Fetch tasks associated with the currentActiveListId
async function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!currentActiveListId || !container) return;

    container.innerHTML = `<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-indigo-500"></i></div>`;
    
    const res = await apiRequest({ action: 'getTasks', listId: currentActiveListId });
    container.innerHTML = ""; // Clear loader

    if (res.success && res.data && res.data.length > 0) {
        res.data.forEach(task => {
            const item = document.createElement('div');
            item.className = "flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm border border-transparent hover:border-indigo-100 transition-all";
            
            const isDone = task.status === 'Completed';
            
            item.innerHTML = `
                <input type="checkbox" ${isDone ? 'checked' : ''} 
                       onchange="updateTaskStatus('${task.task_id}', this.checked)" 
                       class="w-5 h-5 accent-indigo-600">
                <div class="flex-1">
                    <p class="font-medium ${isDone ? 'line-through text-slate-400' : 'text-slate-700 dark:text-white'}">
                        ${task.task_text}
                    </p>
                    <div class="flex gap-4 mt-1">
                        <span class="text-[10px] text-slate-400"><i class="far fa-calendar-alt mr-1"></i>${task.due_date || 'No date'}</span>
                        <span class="text-[10px] text-slate-400"><i class="far fa-clock mr-1"></i>${task.due_time || 'No time'}</span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    } else {
        container.innerHTML = `
            <div class="text-center py-20">
                <p class="text-slate-400">This collection is empty. Add a task above!</p>
            </div>
        `;
    }
}

// Add a New Task to the database
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const textInput = document.getElementById('task-input');
    const dateInput = document.getElementById('task-date');
    const timeInput = document.getElementById('task-time');

    const payload = {
        action: 'addTask',
        listId: currentActiveListId,
        text: textInput.value,
        status: 'Pending',
        dueDate: dateInput.value,
        dueTime: timeInput.value
    };

    showToast("Saving task...");
    const res = await apiRequest(payload);
    
    if (res.success) {
        textInput.value = ""; // Clear input
        loadTasks(); // Refresh list
        showToast("Task added!");
    }
};

// Toggle Task status (Pending vs Completed)
async function updateTaskStatus(taskId, isChecked) {
    const newStatus = isChecked ? 'Completed' : 'Pending';
    const res = await apiRequest({ 
        action: 'updateTaskStatus', 
        taskId: taskId, 
        status: newStatus 
    });
    
    if (res.success) {
        loadTasks(); // Refresh UI to apply line-through
    }
}

/* ============================================================
   4. UI MODALS & SYSTEM HELPERS
   ============================================================ */

function openListModal() { document.getElementById('list-modal').classList.remove('hidden'); }
function closeListModal() { 
    document.getElementById('list-modal').classList.add('hidden'); 
    document.getElementById('list-modal-form').reset(); 
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 z-[400] ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;
    toast.style.bottom = '24px';
    setTimeout(() => { toast.style.bottom = '-100px'; }, 3000);
}

// Custom Web-Style Confirmation
function customConfirm(title, msg, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-msg').innerText = msg;
    modal.classList.remove('hidden');

    document.getElementById('confirm-cancel').onclick = () => modal.classList.add('hidden');
    document.getElementById('confirm-proceed').onclick = () => {
        onConfirm();
        modal.classList.add('hidden');
    };
}

function confirmLogout() {
    customConfirm("Logout", "Are you sure you want to end your session?", () => {
        localStorage.removeItem('todo_user');
        window.location.reload();
    });
}

/* ============================================================
   5. THEME MANAGEMENT
   ============================================================ */
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    const btn = document.getElementById('theme-toggle');
    
    if (isDark) {
        document.body.classList.add('dark-mode');
        if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    applyTheme();
};
