/**
 * Project: TaskFlow Pro
 * Developer: Sagar Dulal
 * Copyright: © 2026 Sagar Dulal
 */

document.addEventListener('DOMContentLoaded', () => {
    initSystemLoader();
    initTheme();
    setupEventListeners();
});

// --- 1. SYSTEM LOADER (10-SECOND SYNC) ---
function initSystemLoader() {
    let progress = 0;
    const circle = document.getElementById('loader-circle');
    const percText = document.getElementById('loader-perc');
    const statusText = document.getElementById('loader-status');
    const messages = [
        "Connecting to Sagar Dulal Cloud...",
        "Fetching User Permissions...",
        "Syncing Database Sheets...",
        "Establishing Secure Node...",
        "Interface Ready."
    ];

    const interval = setInterval(() => {
        progress++;
        const offset = 283 - (283 * progress / 100);
        circle.style.strokeDashoffset = offset;
        percText.innerText = `${progress}%`;

        // Update status text based on percentage
        if (progress < 25) statusText.innerText = messages[0];
        else if (progress < 50) statusText.innerText = messages[1];
        else if (progress < 75) statusText.innerText = messages[2];
        else if (progress < 95) statusText.innerText = messages[3];

        if (progress >= 100) {
            clearInterval(interval);
            statusText.innerText = messages[4];
            setTimeout(() => {
                document.getElementById('master-loader').classList.add('hidden');
                document.getElementById('app-root').classList.replace('opacity-0', 'opacity-100');
                document.body.style.overflow = 'auto';
            }, 600);
        }
    }, 100); // 100ms * 100 = 10,000ms (10 seconds)
}

// --- 2. THEME CONTROLLER ---
function initTheme() {
    const savedTheme = localStorage.getItem('tfp-theme') || 'dark';
    document.documentElement.className = savedTheme;
    updateThemeIcon(savedTheme);

    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
        const current = document.documentElement.className;
        const target = current === 'dark' ? 'light' : 'dark';
        document.documentElement.className = target;
        localStorage.setItem('tfp-theme', target);
        updateThemeIcon(target);
        showSystemAlert("Theme Recalibrated", `Switched to ${target === 'dark' ? 'Blue Neon' : 'White Neon'} mode.`, "success");
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle-btn i');
    icon.className = theme === 'dark' ? 'fas fa-moon mr-2' : 'fas fa-sun mr-2';
}

// --- 3. TASK DEPLOYMENT LOGIC ---
function setupEventListeners() {
    const taskForm = document.getElementById('task-deployment-form');
    const secondaryBtn = document.getElementById('toggle-secondary-btn');
    const secondaryWindow = document.getElementById('secondary-window');
    const archiveReasonSelect = document.getElementById('archive-reason-select');

    // Toggle Secondary Time Slots
    secondaryBtn.addEventListener('click', () => {
        secondaryWindow.classList.toggle('hidden');
        secondaryBtn.innerHTML = secondaryWindow.classList.contains('hidden') 
            ? '<i class="fas fa-clock mr-1"></i> Add Secondary Window (Optional)' 
            : '<i class="fas fa-times mr-1"></i> Remove Secondary Window';
    });

    // Toggle "Other" Reason Textarea
    archiveReasonSelect.addEventListener('change', (e) => {
        const otherText = document.getElementById('archive-other-text');
        otherText.classList.toggle('hidden', e.target.value !== 'Other');
    });

    // Handle Task Submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const taskID = `TFP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const payload = {
            task_id: taskID,
            task_text: document.getElementById('task-text-input').value,
            status: document.getElementById('t-status-select').value,
            start_1: document.getElementById('t-start-1').value,
            end_1: document.getElementById('t-end-1').value,
            start_2: document.getElementById('t-start-2').value || null,
            end_2: document.getElementById('t-end-2').value || null,
            created_at: new Date().toISOString(),
            device_info: navigator.userAgent
        };

        renderTaskCard(payload);
        taskForm.reset();
        if(!secondaryWindow.classList.contains('hidden')) secondaryBtn.click();
        
        showSystemAlert("Deployment Successful", `Task ${taskID} pushed to cluster.`, "success");
        
        // Call API
        if (typeof API !== 'undefined') await API.saveTask(payload);
    });
}

// --- 4. UI RENDERING ---
function renderTaskCard(data) {
    const grid = document.getElementById('task-grid');
    const statusColors = {
        'Not Started': 'border-slate-500 text-slate-500',
        'In Progress': 'border-blue-500 text-blue-500',
        'Completed': 'border-emerald-500 text-emerald-500',
        'Delayed': 'border-amber-500 text-amber-500'
    };

    const cardHTML = `
        <div id="node-${data.task_id}" class="glass-panel p-8 rounded-[2.5rem] relative group animate-in slide-in-from-bottom duration-500 border-neon">
            <div class="flex justify-between items-start mb-6">
                <span class="text-[9px] font-black text-indigo-500 tracking-[0.2em] uppercase">${data.task_id}</span>
                <button onclick="prepareArchive('${data.task_id}')" class="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </div>
            <h3 class="text-lg font-bold text-main mb-6">${data.task_text}</h3>
            
            <div class="flex flex-wrap gap-3 mb-6">
                <span class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[data.status] || 'border-slate-500'}">
                    ${data.status}
                </span>
            </div>

            <div class="pt-6 border-t border-slate-200 dark:border-slate-800/50 flex justify-between items-center">
                <div class="text-dim text-[9px] font-bold uppercase tracking-widest">
                    <i class="far fa-calendar-alt mr-1"></i> ${new Date(data.start_1).toLocaleDateString()}
                </div>
                <button class="text-[9px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Modify Node</button>
            </div>
        </div>
    `;
    grid.insertAdjacentHTML('afterbegin', cardHTML);
}

// --- 5. ARCHIVAL ENGINE ---
let activeArchiveID = null;

function prepareArchive(id) {
    activeArchiveID = id;
    document.getElementById('archive-modal').classList.remove('hidden');
}

function closeArchiveModal() {
    document.getElementById('archive-modal').classList.add('hidden');
    activeArchiveID = null;
}

document.getElementById('confirm-archive-btn').addEventListener('click', async () => {
    if (!activeArchiveID) return;

    const reason = document.getElementById('archive-reason-select').value;
    const other = document.getElementById('archive-other-text').value;
    const finalReason = reason === 'Other' ? other : reason;

    // Remove from UI
    const el = document.getElementById(`node-${activeArchiveID}`);
    if (el) el.remove();

    showSystemAlert("Archived", `Node ${activeArchiveID} moved to Trash_Archive.`, "error");
    closeArchiveModal();

    // Call API to move to Trash_Archive Sheet
    if (typeof API !== 'undefined') {
        await API.archiveTask({
            task_id: activeArchiveID,
            archival_reason: finalReason,
            archived_at: new Date().toISOString(),
            archived_by: "Sagar Dulal"
        });
    }
});

// --- 6. UTILITIES ---
function showSystemAlert(title, body, type) {
    const alertBox = document.getElementById('alert-box');
    const iconArea = document.getElementById('alert-icon-area');
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-body').innerText = body;

    iconArea.style.background = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#6366f1');
    alertBox.classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alert-box').classList.add('hidden');
}

function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
}
