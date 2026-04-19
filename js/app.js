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

// --- UPDATED TASK SUBMISSION (Fixes Database Display) ---
document.getElementById('task-form').onsubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
        action: 'addTask',
        listId: currentListId, // Global variable from when you clicked a list
        text: document.getElementById('task-input').value,
        status: 'Pending',
        dueDate: document.getElementById('task-date').value,
        dueTime: document.getElementById('task-time').value
    };

    showToast("Syncing with database...");
    
    const res = await apiRequest(payload);
    if (res.success) {
        showToast("Task saved!");
        document.getElementById('task-form').reset();
        loadTasks(); // This refreshes the web view immediately
    } else {
        showToast("Database Error", "error");
    }
};

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
