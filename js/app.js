let currentActiveListId = null;

// Initialize
function initApp() {
    applyTheme();
    loadLists();
}

// Sidebar Lists
async function loadLists() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const container = document.getElementById('lists-container');
    if (!user || !container) return;

    const res = await apiRequest({ action: 'getLists', userId: user.id });
    container.innerHTML = "";

    if (res.success && res.data) {
        res.data.forEach(list => {
            const div = document.createElement('div');
            div.className = "group flex items-center justify-between p-3 mb-1 rounded-xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all";
            div.innerHTML = `
                <div>
                    <h4 class="font-bold text-sm dark:text-white">${list.list_title}</h4>
                    <p class="text-[10px] text-slate-400">${list.description || 'No description'}</p>
                </div>
                <i class="fas fa-chevron-right text-[10px] text-slate-300 group-hover:text-indigo-500"></i>
            `;
            div.onclick = () => selectList(list.list_id, list.list_title);
            container.appendChild(div);
        });
    }
}

// Switching Collections
async function selectList(id, title) {
    currentActiveListId = id;
    document.getElementById('active-list-title').innerText = title;
    document.getElementById('task-input-section').classList.remove('hidden');
    loadTasks();
}

// Task Loading
async function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!currentActiveListId || !container) return;

    container.innerHTML = `<p class="text-center text-slate-400 py-10">Loading...</p>`;
    const res = await apiRequest({ action: 'getTasks', listId: currentActiveListId });
    container.innerHTML = "";

    if (res.success && res.data) {
        res.data.forEach(task => {
            const item = document.createElement('div');
            item.className = "flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-transparent hover:border-indigo-100 transition-all";
            item.innerHTML = `
                <input type="checkbox" ${task.status === 'Completed' ? 'checked' : ''} onchange="toggleTaskStatus('${task.task_id}')" class="w-5 h-5 accent-indigo-600 rounded">
                <div class="flex-1">
                    <p class="${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700 dark:text-white font-medium'}">${task.task_text}</p>
                    <div class="flex gap-3 text-[10px] text-slate-400 mt-1">
                        <span><i class="far fa-calendar mr-1"></i>${task.due_date}</span>
                        <span><i class="far fa-clock mr-1"></i>${task.due_time}</span>
                    </div>
                </div>
            `;
            container.appendChild(item);
        });
    }
}

// Add Task Form
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    if (!currentActiveListId) return showToast("Select a list first", "error");

    const payload = {
        action: 'addTask',
        listId: currentActiveListId,
        text: document.getElementById('task-input').value,
        status: 'Pending',
        dueDate: document.getElementById('task-date').value,
        dueTime: document.getElementById('task-time').value
    };

    const res = await apiRequest(payload);
    if (res.success) {
        document.getElementById('task-form').reset();
        loadTasks();
        showToast("Task added!");
    }
};

// Modals & UI
function openListModal() { document.getElementById('list-modal').classList.remove('hidden'); }
function closeListModal() { document.getElementById('list-modal').classList.add('hidden'); document.getElementById('list-modal-form').reset(); }

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `fixed bottom-5 right-5 text-white px-6 py-3 rounded-xl shadow-2xl transition-all duration-300 z-50 ${type === 'error' ? 'bg-red-600' : 'bg-slate-800'}`;
    toast.style.bottom = '20px';
    setTimeout(() => { toast.style.bottom = '-100px'; }, 3000);
}

// Confirmation Dialog
function customConfirm(title, msg, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-msg').innerText = msg;
    modal.classList.remove('hidden');
    document.getElementById('confirm-cancel').onclick = () => modal.classList.add('hidden');
    document.getElementById('confirm-proceed').onclick = () => { onConfirm(); modal.classList.add('hidden'); };
}

function confirmLogout() {
    customConfirm("Logout", "Ready to leave TaskFlow?", () => {
        localStorage.removeItem('todo_user');
        location.reload();
    });
}

// Theme Logic
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    applyTheme();
};
