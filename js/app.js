/**
 * TASKFLOW PRO - MASTER OPERATIONAL ENGINE
 * Architected by Sagar Dulal | © 2026
 * Functional Scope: Task Lifecycle, UI State, & Theme Management
 */

// --- 1. GLOBAL STATE CONFIGURATION ---
let currentUser = JSON.parse(localStorage.getItem('todo_user')) || null;
let activeListId = null;
let activeListTitle = "";

// --- 2. INITIALIZATION PROTOCOL ---
window.onload = () => {
    // Check Authentication Status
    if (currentUser) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        // Identity Branding
        const avatar = document.getElementById('user-avatar');
        if (avatar) avatar.innerText = currentUser.name.charAt(0).toUpperCase();
        
        initializeSystem();
    }
    
    // Theme Persistence
    if (localStorage.getItem('tf_theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    
    // Kill Preloader
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.style.display = 'none';
    }, 1500);
};

async function initializeSystem() {
    await loadLists();
    showToast(`Welcome back, Node ${currentUser.name.split(' ')[0]}`);
}

// --- 3. PROJECT CLUSTER (LISTS) MANAGEMENT ---
async function loadLists() {
    const res = await apiRequest({ action: 'getLists', userId: currentUser.id });
    const container = document.getElementById('lists-container');
    
    if (!res.success) return;

    container.innerHTML = '';
    
    // Add "New Project" Logic if needed, but for now, map existing
    res.data.forEach(list => {
        const btn = document.createElement('button');
        const isActive = activeListId === list.list_id;
        
        btn.className = `w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
            isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`;
        
        btn.onclick = () => selectList(list.list_id, list.list_title);
        
        btn.innerHTML = `
            <div class="flex items-center gap-4">
                <i class="fas fa-folder text-[10px] ${isActive ? 'text-indigo-200' : 'text-indigo-500'}"></i>
                <span class="text-[10px] font-black uppercase tracking-widest">${list.list_title}</span>
            </div>
            <i class="fas fa-chevron-right text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"></i>
        `;
        container.appendChild(btn);
    });
}

function selectList(id, title) {
    activeListId = id;
    activeListTitle = title;
    
    document.getElementById('active-list-title').innerText = title;
    document.getElementById('task-input-section').classList.remove('hidden');
    
    loadTasks();
    loadLists(); // Refresh sidebar UI
}

// --- 4. TASK LIFECYCLE OPERATIONS ---
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const taskData = {
        action: 'addTask',
        listId: activeListId,
        text: document.getElementById('task-input').value,
        status: document.getElementById('task-status').value,
        dueDate: document.getElementById('task-date').value,
        endDate: document.getElementById('task-end-date').value,
        startTime: document.getElementById('task-time-start').value,
        endTime: document.getElementById('task-time-end').value,
        secStart: document.getElementById('task-sec-start').value,
        secEnd: document.getElementById('task-sec-end').value
    };

    const res = await apiRequest(taskData);
    
    if (res.success) {
        showToast("Objective Deployed Successfully");
        e.target.reset();
        loadTasks();
    }
};

async function loadTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = `
        <div class="col-span-full py-20 text-center animate-pulse">
            <i class="fas fa-spinner fa-spin text-indigo-500 mb-4"></i>
            <p class="text-[10px] font-black uppercase text-slate-400">Syncing Node Data...</p>
        </div>
    `;

    const res = await apiRequest({ action: 'getTasks', listId: activeListId });
    
    if (!res.success || res.data.length === 0) {
        container.innerHTML = `
            <div class="col-span-full p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <p class="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No active objectives in this cluster.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    res.data.forEach(task => {
        const card = document.createElement('div');
        card.className = 'task-card animate-slide-up';
        
        // Status Color Logic
        const statusColors = {
            'Completed': 'bg-emerald-500/10 text-emerald-600',
            'In Progress': 'bg-amber-500/10 text-amber-600',
            'Delayed': 'bg-rose-500/10 text-rose-600',
            'Not Started': 'bg-slate-100 text-slate-500'
        };

        card.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <span class="status-pill ${statusColors[task.status] || ''}">${task.status}</span>
                <button onclick="openTrash('${task.task_id}')" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
            
            <h4 class="text-lg font-black dark:text-white leading-tight mb-6">${task.task_text}</h4>
            
            <div class="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div>
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Timeline</p>
                    <p class="text-[10px] font-bold dark:text-slate-300">
                        ${task.due_date || 'N/A'} <span class="text-slate-300">→</span> <span class="text-rose-500">${task.end_date || '??'}</span>
                    </p>
                </div>
                <div>
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1">S1 Focus</p>
                    <p class="text-[10px] font-bold dark:text-slate-300">${task.start1 || '--:--'} to ${task.end1 || '--:--'}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- 5. ARCHIVAL PROTOCOL (TRASH) ---
function openTrash(id) {
    document.getElementById('trash-target-id').value = id;
    document.getElementById('trash-modal').classList.remove('hidden');
}

function closeTrashModal() {
    document.getElementById('trash-modal').classList.add('hidden');
}

document.getElementById('trash-form').onsubmit = async (e) => {
    e.preventDefault();
    const taskId = document.getElementById('trash-target-id').value;
    const reason = document.getElementById('trash-reason').value;

    const res = await apiRequest({ 
        action: 'deleteTask', 
        taskId: taskId, 
        reason: reason 
    });

    if (res.success) {
        showToast("Node Relocated to Archive");
        closeTrashModal();
        loadTasks();
    }
};

// --- 6. UI & THEME UTILITIES ---
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-text').innerText = msg;
    toast.style.bottom = "40px";
    setTimeout(() => { toast.style.bottom = "-100px"; }, 4000);
}

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('tf_theme', isDark ? 'dark' : 'light');
    showToast(`Mode: ${isDark ? 'Dark Neon' : 'Minimal Light'}`);
};

function confirmLogout() {
    if (confirm("Terminate secure session and disconnect?")) {
        localStorage.removeItem('todo_user');
        location.reload();
    }
}

// --- 7. EXTERNAL MODALS (PROJECTS) ---
function openListModal() {
    const title = prompt("Enter Project/Cluster Name:");
    if (title) createList(title);
}

async function createList(title) {
    const res = await apiRequest({ 
        action: 'addList', 
        userId: currentUser.id, 
        title: title 
    });
    if (res.success) {
        showToast("New Cluster Established");
        loadLists();
    }
}
