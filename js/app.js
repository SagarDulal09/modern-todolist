/* ============================================================
   1. PRELOADER & INITIALIZATION
   ============================================================ */
window.addEventListener('load', () => {
    let perc = 0;
    const bar = document.getElementById('loader-progress');
    const text = document.getElementById('loader-perc');
    const preloader = document.getElementById('preloader');
    
    // Smooth loading animation sync
    const interval = setInterval(() => {
        // Random increments to look like a real process
        perc += Math.floor(Math.random() * 15) + 2;
        
        if (perc >= 100) {
            perc = 100;
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.classList.add('hidden'), 500);
                checkSession();
            }, 400);
        }
        
        if(bar) bar.style.width = perc + '%';
        if(text) text.innerText = perc + '%';
    }, 60);
});

function checkSession() {
    const savedUser = localStorage.getItem('todo_user');
    if (savedUser) {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        initApp();
    }
}

function initApp() {
    applyTheme();
    loadLists();
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
            div.className = "group p-4 bg-white dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-transparent hover:border-indigo-200";
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="overflow-hidden">
                        <h4 class="font-bold text-sm truncate dark:text-white">${list.list_title}</h4>
                        <p class="text-[10px] text-slate-400 truncate">${list.description || 'Quick Collection'}</p>
                    </div>
                    <i class="fas fa-chevron-right text-[10px] text-indigo-300"></i>
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
   3. TASK MANAGEMENT (ADVANCED)
   ============================================================ */

async function loadTasks() {
    const container = document.getElementById('tasks-container');
    if (!currentActiveListId) return;

    container.innerHTML = `<div class="py-20 text-center"><i class="fas fa-circle-notch fa-spin text-indigo-500 text-3xl"></i></div>`;
    
    const res = await apiRequest({ action: 'getTasks', listId: currentActiveListId });
    container.innerHTML = "";

    if (res.success && res.data.length > 0) {
        res.data.forEach(task => {
            const statusClass = task.status.toLowerCase().replace(/\s+/g, '-');
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-4";
            
            card.innerHTML = `
                <div class="flex-1">
                    <div class="flex justify-between items-start gap-4 mb-3">
                        <h3 class="font-bold text-slate-800 dark:text-white">${task.task_text}</h3>
                        <span class="status-pill status-${statusClass}">${task.status}</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div class="text-[11px] text-slate-500"><i class="far fa-calendar-alt mr-1 text-indigo-500"></i> ${task.due_date}</div>
                        <div class="text-[11px] text-slate-500"><i class="far fa-clock mr-1 text-indigo-500"></i> ${task.due_time_start} - ${task.due_time_end}</div>
                        ${task.sec_time_start ? 
                          `<div class="text-[11px] text-slate-500"><i class="fas fa-history mr-1 text-purple-500"></i> ${task.sec_time_start} - ${task.sec_time_end}</div>` 
                          : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } else {
        container.innerHTML = `<div class="text-center py-20 text-slate-400">No tasks found in this collection.</div>`;
    }
}

document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;

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

    showToast("Syncing with Database...");
    const res = await apiRequest(payload);
    
    if (res.success) {
        e.target.reset();
        loadTasks();
        showToast("Task Secured Successfully!");
    }
    btn.disabled = false;
};

/* ============================================================
   4. UI UTILITIES & BRANDING
   ============================================================ */

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.bottom = '30px';
    setTimeout(() => { t.style.bottom = '-100px'; }, 3000);
}

function openListModal() { document.getElementById('list-modal').classList.remove('hidden'); }
function closeListModal() { document.getElementById('list-modal').classList.add('hidden'); }

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
    if(confirm("Sagar Dulal says: Are you sure you want to log out?")) {
        localStorage.removeItem('todo_user');
        location.reload();
    }
}

// Copyright Log for Developer
console.log("%c © 2026 Sagar Dulal. All Rights Reserved. ", "background: #6366f1; color: #fff; border-radius: 5px;");
