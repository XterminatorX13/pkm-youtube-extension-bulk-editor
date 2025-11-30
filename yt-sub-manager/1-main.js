// 1-main.js - Core initialization & state management (~380 lines)
        } catch (e) {
    console.error(`[Security] Failed to set localStorage key: ${key}`, e);
    return false;
}
    }

// === GLOBAL STATE ===
let channels = [];
let folders = safeGetLocalStorage("yt-folders", []);
const selectedIds = new Set();
let panelOpen = false;
let viewMode = safeGetLocalStorage("yt-view-mode", "sidebar");
let sidebarPosition = safeGetLocalStorage("yt-sidebar-position", "right");
let isProcessing = false;
let isAutoScrolling = false;
const expandedFolders = new Set();
let scrollPosition = 0;
let updateTimeout = null;
let autoScrollProgress = { current: 0, total: 0, found: 0 };
let showChannels = safeGetLocalStorage("yt-show-channels", true) !== false;
let showFolders = safeGetLocalStorage("yt-show-folders", true) !== false;
let folderPreviewOpen = null;
let foldersModalOpen = false;
let selectionModalOpen = false;
let dropdownOpen = false;
let exportDropdownOpen = false;

// === GLOBAL EXPORTS ===
window.YTSub = {
    // State access
    get state() {
        return {
            channels, folders, selectedIds, panelOpen, viewMode, sidebarPosition,
            isProcessing, isAutoScrolling, expandedFolders, scrollPosition,
            autoScrollProgress, showChannels, showFolders,
            folderPreviewOpen, foldersModalOpen, selectionModalOpen,
            dropdownOpen, exportDropdownOpen
        };
    },
    // State setters
    setState(updates) {
        Object.assign(this.state, updates);
    },
    // Core utilities
    debugLog,
    safeGetLocalStorage,
    safeSetLocalStorage,
    // Will be populated by other modules
    dom: null,
    folders: null,
    export: null,
    ui: null,
    events: null,
    styles: null,
    icons: null,
};

// === UTILITIES ===
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showToast(message) {
    let toast = document.querySelector(".yt-sub-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "yt-sub-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function debouncedUpdateUI() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        if (window.YTSub.ui?.render) {
            window.YTSub.ui.render();
        }
    }, 50);
}

// === FAB (Floating Action Button) ===
function createFAB() {
    if (document.querySelector("#yt-sub-fab")) return;

    const fab = document.createElement("button");
    fab.id = "yt-sub-fab";
    fab.innerHTML = window.YTSub.icons?.grid || '';
    fab.title = "Gerenciar Inscrições";

    fab.addEventListener("click", () => {
        panelOpen = !panelOpen;
        if (panelOpen && channels.length === 0) {
            if (window.YTSub.dom?.scrapeChannels) {
                window.YTSub.dom.scrapeChannels();
            }
        }
        debouncedUpdateUI();
    });

    document.body.appendChild(fab);
}

// === SPA OBSERVER (YouTube navigation) ===
function setupSPAObserver() {
    let lastUrl = location.href;

    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            debugLog("URL changed:", url);

            // Reset channels quando muda de página
            if (!url.includes("/feed/channels")) {
                channels = [];
            } else {
                setTimeout(() => {
                    if (window.YTSub.dom?.scrapeChannels) {
                        window.YTSub.dom.scrapeChannels();
                    }
                }, 1500);
            }

            if (panelOpen) {
                debouncedUpdateUI();
            }
        }
    }).observe(document, { subtree: true, childList: true });
}

// === INITIALIZATION ===
function init() {
    debugLog("YouTube Sub Manager: Iniciando...");

    // Inject styles first
    if (window.YTSub.styles?.inject) {
        window.YTSub.styles.inject();
    }

    // Create FAB
    createFAB();

    // Initial scrape if on channels page
    if (location.href.includes("/feed/channels")) {
        setTimeout(() => {
            if (window.YTSub.dom?.scrapeChannels) {
                window.YTSub.dom.scrapeChannels();
            }
        }, 1500);
    }

    // Setup SPA observer
    setupSPAObserver();

    debugLog("Initialized successfully");
}

// === PUBLIC API ===
window.YTSub.init = init;
window.YTSub.updateUI = debouncedUpdateUI;
window.YTSub.showToast = showToast;
window.YTSub.sleep = sleep;

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
}) ();
