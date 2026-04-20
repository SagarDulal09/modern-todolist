/* Project: TaskFlow Pro
    Developer: Sagar Dulal
    Copyright: © 2026 Sagar Dulal
*/

:root {
    /* Core Dynamics */
    --transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    --neon-blue: #00d2ff;
    --neon-indigo: #6366f1;
}

/* --- THEME DEFINITIONS --- */

/* DARK MODE: Blue Neon Professional */
.dark {
    --bg-main: #020617;
    --bg-sidebar: #0b1120;
    --bg-glass: rgba(15, 23, 42, 0.8);
    --text-primary: #ffffff;
    --text-secondary: #94a3b8;
    --border-color: rgba(0, 210, 255, 0.2);
    --input-bg: #1e293b;
    --shadow-neon: 0 0 20px rgba(0, 210, 255, 0.1);
}

/* LIGHT MODE: White Neon Professional */
.light {
    --bg-main: #f8fafc;
    --bg-sidebar: #ffffff;
    --bg-glass: #ffffff;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    --input-bg: #f1f5f9;
    --shadow-neon: 0 10px 25px -5px rgba(0,0,0,0.05);
}

/* --- GLOBAL STYLES --- */

body {
    background-color: var(--bg-main);
    color: var(--text-primary);
    transition: var(--transition-smooth);
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
}

.text-main { color: var(--text-primary); }
.text-dim { color: var(--text-secondary); }

/* --- UI COMPONENTS --- */

.glass-panel {
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-neon);
    backdrop-filter: blur(12px);
}

.sidebar-bg {
    background: var(--bg-sidebar);
}

.input-field {
    background: var(--input-bg);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    transition: var(--transition-smooth);
}

.input-field:focus {
    border-color: var(--neon-indigo);
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

/* --- NEON EFFECTS --- */

.border-neon {
    border: 1px solid var(--border-color);
}

.dark .border-neon:hover {
    border-color: var(--neon-blue);
    box-shadow: 0 0 15px rgba(0, 210, 255, 0.3);
}

.shadow-neon {
    box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
}

/* --- SOCIAL ICONS --- */

.social-icon {
    width: 100%;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    background: var(--bg-glass);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    transition: var(--transition-smooth);
}

.social-icon:hover {
    color: var(--neon-indigo);
    transform: translateY(-3px);
    border-color: var(--neon-indigo);
}

/* --- LOADER STYLES --- */

.neon-pulse {
    text-shadow: 0 0 10px rgba(99, 102, 241, 0.8);
}

/* --- CUSTOM SCROLLBAR --- */

.custom-scroll::-webkit-scrollbar {
    width: 6px;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background: var(--neon-indigo);
    border-radius: 10px;
}

/* --- TASK CARD ANIMATION --- */

.task-card {
    transition: var(--transition-smooth);
    border-left: 4px solid transparent;
}

.task-card:hover {
    transform: scale(1.01);
    border-left-color: var(--neon-indigo);
}
