// 1-main.js - Core initialization, state, and utilities
; (() => {
    const DEBUG = false

    function debugLog(...args) {
        if (DEBUG) console.log("[YT-Bulk]", ...args)
    }

    function safeGetLocalStorage(key, defaultValue) {
        try {
            const value = localStorage.getItem(key)
            if (value === null) return defaultValue
            const parsed = JSON.parse(value)
            if (key === "yt-folders" && !Array.isArray(parsed)) {
                debugLog(`Invalid data for ${key}, using default`)
                return defaultValue
            }
            return parsed
        } catch (e) {
            console.error(`[Security] Failed to parse localStorage key: ${key}`, e)
            return defaultValue
        }
    }

    function safeSetLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        } catch (e) {
            console.error(`[Security] Failed to set localStorage key: ${key}`, e)
            return false
        }
    }

    debugLog("YouTube Sub Manager: Iniciando...")

    // State
    let channels = []
    let folders = safeGetLocalStorage("yt-folders", [])
    const selectedIds = new Set()
    let panelOpen = false
    let viewMode = safeGetLocalStorage("yt-view-mode", "sidebar")
    let sidebarPosition = safeGetLocalStorage("yt-sidebar-position", "right")
    let isProcessing = false
    const expandedFolders = new Set()
    let scrollPosition = 0
    let updateTimeout = null
    let isAutoScrolling = false
    let autoScrollProgress = { current: 0, total: 0, found: 0 }
    let showChannels = safeGetLocalStorage("yt-show-channels", true) !== false
    let showFolders = safeGetLocalStorage("yt-show-folders", true) !== false
    let folderPreviewOpen = null
    let foldersModalOpen = false
    let selectionModalOpen = false
    let dropdownOpen = false
    let exportDropdownOpen = false

    // SVG Icons
    const icons = {
        youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
        close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
        check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
        folder: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
        trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
        refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6M3 22v-6h6M21 13a9 9 0 1 1-3-7.7M3 11a9 9 0 0 1 3 7.7"/></svg>`,
        grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
        chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
        plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
        eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
        settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
        list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
        download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
        loader: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`,
        externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
        expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>`
    }

    function saveFolders() {
        safeSetLocalStorage("yt-folders", folders)
    }

    function saveVisibility() {
        safeSetLocalStorage("yt-show-channels", showChannels)
        safeSetLocalStorage("yt-show-folders", showFolders)
    }

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms))
    }

    function showToast(message) {
        let toast = document.querySelector(".yt-sub-toast")
        if (!toast) {
            toast = document.createElement("div")
            toast.className = "yt-sub-toast"
            document.body.appendChild(toast)
        }
        toast.textContent = message
        toast.classList.add("show")
        setTimeout(() => toast.classList.remove("show"), 3000)
    }

    function getChannelById(id) {
        return channels.find((c) => c.id === id)
    }

    function updateStatus(text) {
        const statusEl = document.querySelector("#yt-sub-status")
        if (statusEl) statusEl.textContent = text
    }

    function debouncedUpdateUI() {
        clearTimeout(updateTimeout)
        updateTimeout = setTimeout(() => {
            window.YTSubUpdateUIInternal()
        }, 50)
    }

    function updateUI() {
        debouncedUpdateUI()
    }

    function escapeHTML(str) {
        if (!str) return ""
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
    }

    function createNewFolder() {
        const name = prompt("Nome da nova pasta:")
        if (name && name.trim()) {
            const newFolder = {
                id: `folder-${Date.now()}`,
                name: name.trim(),
                channels: Array.from(selectedIds),
            }
            folders.push(newFolder)
            saveFolders()
            selectedIds.clear()
            expandedFolders.add(newFolder.id)
            updateUI()
            showToast(`Pasta "${name}" criada com ${newFolder.channels.length} canal(is)`)
        }
    }

    // Export global API
    window.YTSubState = {
        get channels() { return channels },
        set channels(val) { channels = val },
        folders,
        selectedIds,
        get panelOpen() { return panelOpen },
        set panelOpen(val) { panelOpen = val },
        viewMode,
        sidebarPosition,
        get isProcessing() { return isProcessing },
        set isProcessing(val) { isProcessing = val },
        expandedFolders,
        scrollPosition,
        get isAutoScrolling() { return isAutoScrolling },
        set isAutoScrolling(val) { isAutoScrolling = val },
        autoScrollProgress,
        showChannels,
        showFolders,
        get folderPreviewOpen() { return folderPreviewOpen },
        set folderPreviewOpen(val) { folderPreviewOpen = val },
        get foldersModalOpen() { return foldersModalOpen },
        set foldersModalOpen(val) { foldersModalOpen = val },
        get selectionModalOpen() { return selectionModalOpen },
        set selectionModalOpen(val) { selectionModalOpen = val },
        get dropdownOpen() { return dropdownOpen },
        set dropdownOpen(val) { dropdownOpen = val },
        get exportDropdownOpen() { return exportDropdownOpen },
        set exportDropdownOpen(val) { exportDropdownOpen = val },
    }

    window.YTSubUtils = {
        debugLog,
        safeGetLocalStorage,
        safeSetLocalStorage,
        saveFolders,
        saveVisibility,
        sleep,
        showToast,
        getChannelById,
        updateStatus,
        updateUI,
        escapeHTML,
        createNewFolder,
        icons,
    }
})()
