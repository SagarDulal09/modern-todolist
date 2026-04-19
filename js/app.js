/**
 * TASKFLOW PRO - MASTER APPLICATION LOGIC
 * Architected by Sagar Dulal | © 2026
 * Features: Network-Aware Loading, Multi-Device Sync, Relational Data Mapping
 */

/* ============================================================
   1. GLOBAL STATE & INITIALIZATION
   ============================================================ */
let currentUser = JSON.parse(localStorage.getItem('todo_user')) || null;
let activeListId = null;

// Initialize System on Load
window.addEventListener('load', () => {
    initializeEnvironment();
});

/**
 * High-End Network-Aware Preloader
 * Adjusts animation duration based on effective connection type
 */
function initializeEnvironment() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    let latencyBuffer = 50; // Standard speed

    if (conn) {
        const type = conn.effectiveType; // '4g', '3g', etc.
        document.getElementById('network-speed').innerText = `NODE: ${type.toUpperCase()} STABLE`;
        if (type === '4g') latencyBuffer = 20;
        if (type === '3g' || type === '2g') latencyBuffer = 100;
    }

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 2;
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            finalizeBoot();
        }
        document.getElementById('loader-progress').style.width = `${progress}%`;
        document.getElementById('loader-perc').innerText = `${progress}%`;
    }, latencyBuffer);
}

function finalizeBoot() {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        
        // Multi-Device Security Check
        const currentDevice = navigator.userAgent;
        const lastDevice = localStorage.getItem('last_known_device');
        
        if (currentUser && lastDevice && lastDevice !== currentDevice) {
            showToast("⚠️ SECURITY ALERT: New device access detected", "warning");
        }
        localStorage.setItem('last_known_device', currentDevice);

        // Standard Auth Check (from auth.js)
        if (typeof checkAuthSession === "function") checkAuthSession();
    }, 500);
}

/* ============================================================
   2. CORE APPLICATION HANDLERS
   ============================================================ */

/**
 * Boots the main dashboard data
 */
async function initApp() {
    if (!currentUser) return;
    
    // UI Personalization
    document.getElementById('user-name-display').innerText = currentUser.name;
    document.getElementById('user-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    
    await loadUserLists();
    
    // Theme Restoration
    const savedTheme = localStorage.getItem('tf_theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcon(true);
    }
}

/**
 * Fetches and renders project clusters (Lists)
 */
async function loadUserLists() {
    const res = await apiRequest({ action: 'getLists', userId: currentUser.id });
    const container = document.getElementById('lists-container');
    container.innerHTML = '';

    if (res.success && res.data.length > 0) {
        res.data.forEach((list, index) => {
            const btn = document.createElement('button');
            btn.className = `w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeListId === list.list_id ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`;
            btn.onclick = () => selectList(list.list_id, list.list_title);
            btn.innerHTML = `
                <i class="fas fa-folder text-sm ${activeListId === list.list_id ? 'text-indigo-200' : 'text-slate-400'}"></i>
                <span class="text-xs font-black uppercase tracking-widest">${list.list_title}</span>
            `;
            container.appendChild(btn);
            
            // Auto-select first list on boot
            if (!activeListId && index === 0) selectList(list.list_id, list.list_title);
        });
    } else {
        container.innerHTML = `<p class="text-[10px] text-center text-slate-400 p-4">No active clusters found.</p>`;
    }
}

async function selectList(id, title) {
    activeListId = id;
    document.getElementById('active-list-title').innerText = title;
    document.getElementById('task-input-section').classList.remove('hidden');
    
    // Refresh list styling
    loadUserLists();
    loadTasks();
}

/* ============================================================
   3. TASK OPERATIONS (THE ENGINE)
   ============================================================ */

document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    if (!activeListId) return showToast("Select a project cluster first.");

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

    APILoader.show();
    const res = await apiRequest(taskData);
    if (res.success) {
        showToast("Mission Objective Deployed");
        e.target.reset();
        loadTasks();
    }
    APILoader.hide();
};

async function loadTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '<div class="col-span-full shimmer h-32 rounded-[2rem]"></div>';

    const res = await apiRequest({ action: 'getTasks', listId: activeListId });
    container.innerHTML = '';

    if (res.success) {
        res.data.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card animate-slide-up group';
            card.innerHTML = `
                <div class="flex justify-between items-start mb-6">
                    <span class="status-pill status-${task.status.toLowerCase().replace(/\s/g, '-')}">${task.status}</span>
                    <button onclick="openTrashModal('${task.task_id}')" class="text-slate-300 hover:text-red-500 transition-colors">
                        <i class="fas fa-archive"></i>
                    </button>
                </div>
                <h4 class="text-lg font-black mb-4 dark:text-white">${task.task_text}</h4>
                <div class="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <div class="flex items-center gap-2"><i class="far fa-calendar-check text-indigo-500"></i> Start: ${task.due_date}</div>
                    <div class="flex items-center gap-2"><i class="far fa-calendar-times text-red-500"></i> End: ${task.end_date || 'N/A'}</div>
                </div>
                <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div class="flex gap-4">
                        <div class="flex flex-col">
                            <span class="text-[8px] text-slate-400">Primary Slot</span>
                            <span class="text-[10px] text-indigo-600 font-black">${task.start1 || '--'} to ${task.end1 || '--'}</span>
                        </div>
                    </div>
                    <button onclick="updateTaskStatus('${task.task_id}')" class="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                        <i class="fas fa-sync-alt text-[10px]"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    }
}

/* ============================================================
   4. UI UTILITIES (THEME, TOAST, LOGOUT)
   ============================================================ */

document.getElementById('theme-toggle').onclick = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('tf_theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
};

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    icon.className = isDark ? 'fas fa-sun text-yellow-400 text-xl' : 'fas fa-moon text-indigo-600 text-xl';
}

function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toast-text');
    text.innerText = message;
    
    toast.style.bottom = "40px";
    setTimeout(() => { toast.style.bottom = "-100px"; }, 4000);
}

function confirmLogout() {
    if (confirm("Terminate secure session and disconnect?")) {
        localStorage.removeItem('todo_user');
        location.reload();
    }
}

function openTrashModal(id) {
    document.getElementById('trash-target-id').value = id;
    document.getElementById('trash-modal').classList.remove('hidden');
}

function closeTrashModal() {
    document.getElementById('trash-modal').classList.add('hidden');
}

document.getElementById('trash-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('trash-target-id').value;
    const reason = document.getElementById('trash-reason').value === 'other' ? 
                   document.getElementById('trash-reason-other').value : 
                   document.getElementById('trash-reason').value;

    APILoader.show();
    const res = await apiRequest({ action: 'deleteTask', taskId: id, reason: reason });
    if (res.success) {
        showToast("Node Relocated to Archive");
        closeTrashModal();
        loadTasks();
    }
    APILoader.hide();
};
