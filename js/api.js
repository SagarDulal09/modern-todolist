/**
 * TaskFlow Pro API Connector
 * Developer: Sagar Dulal
 * Purpose: Handles all CRUD operations between UI and Google Apps Script
 */

const CONFIG = {
    // PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx679qgSU8Nz95hDDJJdiXW8H8ZJRNciAMKeBvgNwjgkpY91XTPuVP8wWPevTN7YWl-JA/exec",
    VERSION: "1.0.4",
    DEV: "Sagar Dulal"
};

const API = {
    /**
     * Core Request Engine
     */
    async _request(action, payload) {
        try {
            // Add metadata to every request for System_Logs
            const enrichedPayload = {
                action: action,
                metadata: {
                    timestamp: new Date().toISOString(),
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    screen: `${window.innerWidth}x${window.innerHeight}`
                },
                ...payload
            };

            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // Necessary for Google Apps Script cross-domain
                cache: "no-cache",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(enrichedPayload)
            });

            // Note: with no-cors, we cannot read the response body. 
            // For a robust system, use a 'success' callback logic or 
            // standard 'cors' if your Script header allows it.
            return { status: "dispatched", message: "Command sent to Cluster" };
            
        } catch (error) {
            console.error("Critical System Error:", error);
            showSystemAlert("Sync Failure", "Could not connect to Database Node", "error");
            throw error;
        }
    },

    /**
     * Authentication & Security (OTP_LOG Sheet)
     */
    async logSecurityEvent(email, type, code = "") {
        return await this._request("logSecurity", {
            email: email,
            event_type: type, // e.g., 'LOGIN_ATTEMPT', 'OTP_GENERATE'
            otp_code: code
        });
    },

    /**
     * Task Management (Tasks Sheet)
     * Headers: task_id, list_id, task_text, status, start_1, end_1, start_2, end_2, created_at, device_info
     */
    async saveTask(taskData) {
        return await this._request("insertTask", {
            task_id: taskData.task_id,
            list_id: taskData.list_id || "default",
            task_text: taskData.task_text,
            status: taskData.status,
            start_1: taskData.start_1,
            end_1: taskData.end_1,
            start_2: taskData.start_2 || "",
            end_2: taskData.end_2 || "",
            device_info: navigator.userAgent
        });
    },

    /**
     * Archival Logic (Trash_Archive Sheet)
     * Headers: ...all task headers + archival_reason, archived_at, archived_by
     */
    async archiveTask(taskData, reason) {
        return await this._request("moveToArchive", {
            ...taskData,
            archival_reason: reason,
            archived_by: "Sagar Dulal (Admin)"
        });
    },

    /**
     * Collection Management (Lists Sheet)
     * Headers: ListID, UserID, Title, Discription, color_tag
     */
    async createCollection(listData) {
        return await this._request("insertList", {
            ListID: "LST-" + Date.now(),
            UserID: "USER-SD-01",
            Title: listData.title,
            Description: listData.desc || "",
            color_tag: listData.color || "#6366f1"
        });
    },

    /**
     * Fetching Data
     * Since Apps Script 'POST' is one-way in no-cors, 
     * use 'GET' for retrieving the task feed.
     */
    async fetchClusterData() {
        try {
            const response = await fetch(`${CONFIG.SCRIPT_URL}?action=getData`);
            const data = await response.json();
            return data; // Returns object with tasks[] and lists[]
        } catch (e) {
            console.warn("Retrying database handshake...");
            return null;
        }
    }
};

/**
 * Utility: Global Alert Trigger
 */
function showSystemAlert(title, body, type = "info") {
    const alertEl = document.getElementById('system-alert');
    const titleEl = document.getElementById('alert-title');
    const bodyEl = document.getElementById('alert-body');
    const iconBox = document.getElementById('alert-icon-box');

    titleEl.innerText = title;
    bodyEl.innerText = body;
    
    // Change color based on type
    if(type === "error") iconBox.style.backgroundColor = "#f43f5e";
    else if(type === "success") iconBox.style.backgroundColor = "#10b981";
    else iconBox.style.backgroundColor = "#6366f1";

    alertEl.classList.remove('hidden');
    setTimeout(() => {
        alertEl.style.opacity = "1";
        alertEl.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        alertEl.style.opacity = "0";
        alertEl.style.transform = "translateY(20px)";
        setTimeout(() => alertEl.classList.add('hidden'), 500);
    }, 4000);
}
