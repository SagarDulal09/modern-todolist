const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBnJA-bySZumgVenlMExqcVZUsUSdo3Efxywx_lHL6pFeNXQ6Uxg4bUz2fwKYw9ohJaw/exec";

async function apiRequest(data) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        const result = await response.json();
        return result;
    } catch (err) {
        console.error("API Error:", err);
        return { success: false, message: "Network error. Check connection." };
    }
}
