/**
 * TaskFlow Pro - Application Logic
 * Operator: Sagar Dulal
 * Version: 1.0.4
 */

// 1. GLOBAL STATE
let currentTasks = [];
let currentLists = [];
let activeListId = 'all';

// 2. THE 10-SECOND SYSTEM INITIALIZATION
function initializeSystem() {
    const loader = document.getElementById('master-loader');
    const circle = document.getElementById('loader-circle');
    const percText = document.getElementById('loader-perc');
    const statusBar = document.getElementById('loader-bar');
    const statusText = document.getElementById('loader-status');
    
    let progress = 0;
    const duration = 10000; // 10 Seconds
    const interval = 100; // Update every 100ms
    const step = 100 / (duration / interval);

    const statuses = [
        "Handshaking with Database...",
        "Authenticating Security Nodes...",
        "Fetching Task Clusters...",
        "Optimizing UI Thread...",
        "Synchronizing Assets...",
        "System Ready."
    ];

    const syncInterval = setInterval(() => {
        progress += step;
        if (progress > 100) progress = 100;

        // Update Visuals
        const offset = 283 - (283 * progress) / 100;
        circle.style.strokeDashoffset = offset;
        percText.innerText = `${Math.round(progress)}%`;
        statusBar.style.width = `${progress}%`;

        // Update Status Text based on progress
        const statusIdx = Math.floor((progress / 100) * (statuses.length - 1));
        statusText.innerText = statuses[statusIdx];

        if (progress >= 100) {
            clearInterval(syncInterval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.classList.add('hidden');
                    checkAuthStatus(); // Proceed to Auth Check
                }, 500);
            }, 500);
        }
    }, interval);
}

// 3. TASK DEPLOYMENT LOGIC
document.getElementById('task-deployment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        task_id: "TSK-" + Date.now(),
        task_text: document.getElementById('task-text-input').value,
        start_1: document.getElementById('t-start-1').value,
        end_1: document.getElementById('t-end-1').value,
        start_2: document.getElementById('t-start-2').value || "",
        end_2: document.getElementById('t-end-2').value || "",
        status: document.getElementById('t-status-select').value,
        list_id: activeListId
    };

    try {
        showSystemAlert("Deploying", "Uploading objective to cluster...", "info");
        await API.saveTask(taskData);
        
        // Optimistic UI Update
        currentTasks.unshift(taskData);
        renderTasks();
        
        e.target.reset();
        showSystemAlert("Success", "Objective deployed successfully", "success");
    } catch (err) {
        showSystemAlert("Error", "Deployment sequence failed", "error");
    }
});

// 4. DYNAMIC RENDERING ENGINE
function renderTasks() {
    const grid = document.getElementById('task-grid');
    grid.innerHTML = '';

    const filtered = activeListId === 'all' 
        ? currentTasks 
        : currentTasks.filter(t => t.list_id === activeListId);

    filtered.forEach(task => {
        const card = document.createElement('div');
        card.className = "task-card glass-panel p-8 rounded-[2.5rem] border-neon animate-in fade-in slide-in-from-bottom-4";
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-6">
                <span class="status-tag status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
                <button onclick="openArchiveModal('${task.task_id}')" class="text-slate-500 hover:text-rose-500 transition-colors">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-4">${task.task_text}</h3>
            <div class="space-y-2">
                <div class="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <i class="fas fa-calendar-day text-indigo-500"></i>
                    <span>PRI: ${new Date(task.start_1).toLocaleString()}</span>
                </div>
                ${task.start_2 ? `
                <div class="flex items-center gap-3 text-[10px] font-bold text-indigo-400">
                    <i class="fas fa-clock"></i>
                    <span>SEC: ${new Date(task.start_2).toLocaleString()}</span>
                </div>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

// 5. ARCHIVAL (RELOCATION) WORKFLOW
let taskToArchive = null;

function openArchiveModal(id) {
    taskToArchive = id;
    document.getElementById('archive-modal').classList.remove('hidden');
}

document.getElementById('confirm-archive-btn').addEventListener('click', async () => {
    const reason = document.getElementById('archive-reason-select').value;
    const task = currentTasks.find(t => t.task_id === taskToArchive);

    if (task) {
        showSystemAlert("Archiving", "Relocating node to Trash_Archive...", "info");
        await API.archiveTask(task, reason);
        
        currentTasks = currentTasks.filter(t => t.task_id !== taskToArchive);
        renderTasks();
        
        document.getElementById('archive-modal').classList.add('hidden');
        showSystemAlert("Archived", "Task moved to database archive", "success");
    }
});

// 6. THEME MANAGEMENT
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 7. SIDEBAR & MOBILE NAVIGATION
function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
}

// 8. STARTUP SCRIPT
window.onload = () => {
    // Set Theme
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.remove('dark');
    }
    
    // Start the 10s Loader
    initializeSystem();
};
