/**
 * Project: TaskFlow Pro 
 * Developer: Sagar Dulal
 * Purpose: Centralized API Controller for Database Sheets
 * Copyright: © 2026 Sagar Dulal
 */

const DATABASE_CONFIG = {
    // Replace this URL with your Google Apps Script Web App URL
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbx679qgSU8Nz95hDDJJdiXW8H8ZJRNciAMKeBvgNwjgkpY91XTPuVP8wWPevTN7YWl-JA/exec",
    VERSION: "1.0.4",
    DEV: "Sagar Dulal"
};

const API = {
    /**
     * Core Request Handler
     * @param {Object} payload - The data to send
     * @param {string} action - The database action (e.g., 'addTask', 'fetchLists')
     */
    async request(action, payload = {}) {
        try {
            const response = await fetch(DATABASE_CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Use 'cors' if your script handles OPTIONS requests
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    timestamp: new Date().toISOString(),
                    device: navigator.userAgent,
                    ...payload
                })
            });

            // Note: 'no-cors' mode will return an opaque response.
            // For a professional setup, ensure your Apps Script return JSON with CORS headers.
            return { status: "success", message: "Payload Dispatched to Sagar Dulal Cloud" };
        } catch (error) {
            console.error("API Error:", error);
            return { status: "error", message: error.message };
        }
    },

    /**
     * Task Sheet Handlers
     */
    async saveTask(taskData) {
        // Matches headers: task_id, list_id, task_text, status, start_date, end_date, start_1, end_1, start_2, end_2, created_at, device_info
        return await this.request('insertTask', taskData);
    },

    async archiveTask(archiveData) {
        // Matches Trash_Archive headers: Includes archival_reason, archived_at, archived_by
        return await this.request('moveToArchive', archiveData);
    },

    async updateStatus(taskId, newStatus) {
        return await this.request('updateTaskStatus', { task_id: taskId, status: newStatus });
    },

    /**
     * Collection/Lists Handlers
     */
    async saveList(listData) {
        // Matches Lists headers: ListID, UserID, Title, Discription, color_tag
        return await this.request('insertList', listData);
    },

    /**
     * Log Handlers
     */
    async logSystemEvent(userId, eventType) {
        // Matches System_Logs: log_id, user_id, event_type, ip_hint, timestamp
        return await this.request('writeLog', {
            user_id: userId,
            event_type: eventType
        });
    }
};

// Security Freeze to prevent modification by external scripts
Object.freeze(API);
Object.freeze(DATABASE_CONFIG);
