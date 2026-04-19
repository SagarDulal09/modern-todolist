/**
 * TASKFLOW PRO CORE ENGINE
 * Developed by Sagar Dulal | © 2026
 * Featuring: Dual-Session Tracking, Trash Reason Logic, & Neon Theme Sync
 */

/* ============================================================
   1. APP INITIALIZATION & PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
    let perc = 0;
    const progress = document.getElementById('loader-progress');
    const text = document.getElementById('loader-perc');
    const preloader = document.getElementById('preloader');
    
    const interval = setInterval(() => {
        perc += Math.floor(Math.random() * 12) + 3;
        if (perc >= 100) {
            perc = 100;
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    checkAuthSession();
                }, 500);
            }, 500);
        }
        if(progress) progress.style.width = perc + '%';
        if(text) text.innerText = perc + '%';
    }, 50);
});

function initApp() {
    applyTheme();
    loadLists();
    updateUserUI();
}

function updateUserUI() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const avatar = document.getElementById('user-avatar');
    if (user && avatar) avatar.innerText = user.name.charAt(0).toUpperCase();
}

/* ============================================================
   2. COLLECTION / LIST MANAGEMENT
   ============================================================ */
let currentActiveListId = null;

async function loadLists() {
    const user = JSON.parse(localStorage.getItem('todo_user'));
    const container = document.getElementById('lists-container');
    if (!user || !container) return;

    const res = await apiRequest({ action: 'getLists', userId: user.id });
    container.innerHTML = "";

    if (res.success && res.data) {
        res.data.forEach(list => {
            const div = document.createElement('div');
            div.className = "group p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all border border-transparent hover:border-indigo-400";
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="overflow-hidden">
                        <h4 class="font-bold text-sm truncate dark:text-white group-hover:text-white">${list.list_title}</h4>
                        <p class="text-[10px] text-slate-400 truncate group-hover:text-indigo-100">${list.description || 'Project Workspace'}</p>
                    </div>
                    <i class="fas fa-chevron-right text-[10px] text-indigo-300 group-hover:text-white group-hover:translate-x-1 transition-all"></i>
                </div>
            `;
            div.onclick = () => selectList(list.list_id, list.list_title);
            container.appendChild(div);
        });
    }
}

function selectList(id, title) {
    currentActiveListId = id;
    document.getElementById('active-list-title').innerText = title;
    document.getElementById('task-input-section').classList.remove('hidden');
    loadTasks();
}

/* ============================================================
   3. TASK OPERATIONS (THE CORE)
   ============================================================ */

async function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!currentActiveListId) return;

    container.innerHTML = `<div class="py-20 text-center animate-pulse"><i class="fas fa-circle-notch fa-spin text-indigo-500 text-3xl mb-4"></i><p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Database...</p></div>`;
    
    const res = await apiRequest({ action: 'getTasks', listId: currentActiveListId });
    container.innerHTML = "";

    if (res.success && res.data.length > 0) {
        res.data.forEach(task => {
            const statusClass = task.status.toLowerCase().replace(/\s+/g, '-');
            const card = document.createElement('div');
            card.className = "glass-card p-6 mb-4 animate-slide-up flex flex-col md:flex-row md:items-center gap-6 group hover:border-indigo-500 transition-all";
            
            card.innerHTML = `
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-4">
                        <span class="status-pill status-${statusClass}">${task.status}</span>
                        <div class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="editTaskStatus('${task.task_id}', '${task.status}')" class="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:scale-110 transition"><i class="fas fa-pen-nib text-[10px]"></i></button>
                            <button onclick="openTrashModal('${task.task_id}')" class="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:scale-110 transition"><i class="fas fa-trash-alt text-[10px]"></i></button>
                        </div>
                    </div>
                    <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-3">${task.task_text}</h3>
                    <div class="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <span class="flex items-center gap-2"><i class="far fa-calendar-check text-indigo-500"></i> ${task.due_date}</span>
                        <span class="flex items-center gap-2"><i class="far fa-clock text-indigo-500"></i> ${task.start1} - ${task.end1}</span>
                        ${task.start2 ? `<span class="flex items-center gap-2"><i class="fas fa-history text-purple-500"></i> ${task.start2} - ${task.end2}</span>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<div class="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]"><p class="text-slate-400 font-bold uppercase tracking-widest text-xs">No Active Tasks In This Collection</p></div>`;
    }
}

// Create New Task
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    APILoader.show();

    const payload = {
        action: 'addTask',
        listId: currentActiveListId,
        text: document.getElementById('task-input').value,
        status: document.getElementById('task-status').value,
        dueDate: document.getElementById('task-date').value,
        startTime: document.getElementById('task-time-start').value,
        endTime: document.getElementById('task-time-end').value,
        secStart: document.getElementById('task-sec-start').value,
        secEnd: document.getElementById('task-sec-end').value
    };

    const res = await apiRequest(payload);
    if (res.success) {
        e.target.reset();
        loadTasks();
        showToast("Task Deployed Successfully");
    }
    APILoader.hide();
};

/* ============================================================
   4. EDIT & TRASH SYSTEM (WITH REASONS)
   ============================================================ */

// Quick Status Update
async function editTaskStatus(taskId, currentStatus) {
    const statuses = ["Not Started", "In Progress", "Completed", "Delayed"];
    const newStatus = prompt(`Update Status (Current: ${currentStatus}):\n${statuses.join(", ")}`);
    
    if (newStatus && statuses.includes(newStatus)) {
        APILoader.show();
        const res = await apiRequest({ action: 'updateTaskStatus', taskId, status: newStatus });
        if(res.success) loadTasks();
        APILoader.hide();
    } else if (newStatus) {
        showToast("Invalid Status Option", "error");
    }
}

// Trash Workflow
function openTrashModal(taskId) {
    document.getElementById('trash-target-id').value = taskId;
    document.getElementById('trash-modal').classList.remove('hidden');
}

function closeTrashModal() {
    document.getElementById('trash-modal').classList.add('hidden');
    document.getElementById('trash-form').reset();
    document.getElementById('other-reason-container').classList.add('hidden');
}

document.getElementById('trash-form').onsubmit = async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('trash-target-id').value;
    const selectReason = document.getElementById('trash-reason').value;
    const customReason = document.getElementById('trash-reason-other').value;
    
    const finalReason = selectReason === 'other' ? `Other: ${customReason}` : selectReason;

    if (selectReason === 'other' && !customReason.trim()) {
        showToast("Please specify the custom reason.");
        return;
    }

    APILoader.show();
    const res = await apiRequest({ 
        action: 'deleteTask', 
        taskId: taskId, 
        reason: finalReason 
    });

    if (res.success) {
        closeTrashModal();
        loadTasks();
        showToast("Task Archived to Trash");
    }
    APILoader.hide();
};

/* ============================================================
   5. UI UTILITIES & THEME
   ============================================================ */

function showToast(msg) {
    const t = document.getElementById('toast');
    const txt = document.getElementById('toast-text');
    txt.innerText = msg;
    t.style.bottom = '40px';
    setTimeout(() => { t.style.bottom = '-100px'; }, 3000);
}

function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    const btn = document.getElementById('theme-toggle');
    if (isDark) {
        document.body.classList.add('dark-mode');
        btn.innerHTML = '<i class="fas fa-sun text-yellow-400"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    applyTheme();
};

function confirmLogout() {
    if(confirm("Sagar Dulal says: End this session?")) {
        localStorage.removeItem('todo_user');
        location.reload();
    }
}

function openListModal() { document.getElementById('list-modal').classList.remove('hidden'); }
function closeListModal() { document.getElementById('list-modal').classList.add('hidden'); }

// Collection Creation
document.getElementById('list-modal-form').onsubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('todo_user'));
    APILoader.show();
    
    const res = await apiRequest({
        action: 'addList',
        userId: user.id,
        title: document.getElementById('modal-list-title').value,
        desc: document.getElementById('modal-list-desc').value
    });

    if (res.success) {
        closeListModal();
        loadLists();
        showToast("Collection Deployed");
    }
    APILoader.hide();
};
