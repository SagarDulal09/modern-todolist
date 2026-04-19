/**
 * TASKFLOW PRO API ENGINE
 * Developed by Sagar Dulal | © 2026
 * * Guiding Principle: Invisible, Robust, and High-Performance
 */

// Your Specific Deployment URL (Verified for Sagar Dulal)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBnJA-bySZumgVenlMExqcVZUsUSdo3Efxywx_lHL6pFeNXQ6Uxg4bUz2fwKYw9ohJaw/exec";

/**
 * Standardized API Fetcher
 * @param {Object} data - The payload for the action
 */
async function apiRequest(data) {
    // 1. Log outgoing request (Developer Mode)
    console.log(`%c[OUTGOING]: ${data.action}`, "color: #38bdf8; font-weight: bold;");

    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "cors", 
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify(data)
        });

        // 2. Handle HTTP Errors
        if (!response.ok) {
            throw new Error(`Network Response Error: ${response.status}`);
        }

        const result = await response.json();
        
        // 3. Log incoming response
        if (result.success) {
            console.log(`%c[SUCCESS]: ${data.action}`, "color: #22c55e; font-weight: bold;");
        } else {
            console.warn(`[API ERROR]: ${result.message || 'Unknown Failure'}`);
        }
        
        return result;

    } catch (error) {
        console.error("%c[CRITICAL API FAILURE]:", "color: #ef4444; font-size: 14px; font-weight: bold;", error);
        
        // Return a standardized failure object so the app doesn't crash
        return { 
            success: false, 
            message: "Connection Timeout. Please check your internet or Google Script URL." 
        };
    }
}

/**
 * GLOBAL UI LOADER HELPER
 * Can be called from any JS file to show activity
 */
const APILoader = {
    show: () => {
        const toast = document.getElementById('toast');
        const text = document.getElementById('toast-text');
        if(toast && text) {
            text.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> Syncing with Database...`;
            toast.style.bottom = '30px';
        }
    },
    hide: () => {
        const toast = document.getElementById('toast');
        if(toast) {
            setTimeout(() => {
                toast.style.bottom = '-100px';
            }, 800);
        }
    }
};

/* --- SYSTEM BRANDING --- */
console.log(
    "%c TASKFLOW PRO %c Developed by Sagar Dulal %c v2.0 ",
    "background: #6366f1; color: #fff; padding: 5px; border-radius: 5px 0 0 5px;",
    "background: #0f172a; color: #fff; padding: 5px;",
    "background: #38bdf8; color: #000; padding: 5px; border-radius: 0 5px 5px 0;"
);
