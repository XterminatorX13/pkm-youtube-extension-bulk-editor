// 6-events.js - Event listeners (~350 lines)
(() => {
    function attachEvents() {
        const { state } = window.YTSub;

        // Close panel
        document.querySelector("#yt-sub-close")?.addEventListener("click", () => {
            state.panelOpen = false;
            window.YTSub.updateUI();
        });

        // Refresh channels
        document.querySelector("#yt-sub-refresh")?.addEventListener("click", () => {
            state.channels = [];
            window.YTSub.dom?.scrapeChannels();
            window.YTSub.updateUI();
        });

        // Load all channels
        document.querySelector("#yt-sub-load-all")?.addEventListener("click", () => {
            window.YTSub.dom?.autoScrollAndLoad();
        });

        // Open folders modal
        document.querySelector("#yt-sub-open-folders")?.addEventListener("click", () => {
            window.YTSub.folders?.openFoldersModal();
        });

        // Select all toggle
        document.querySelector("#yt-sub-select-all")?.addEventListener("click", () => {
            const { channels, selectedIds } = state;
            if (selectedIds.size === channels.length && channels.length > 0) {
                selectedIds.clear();
            } else {
                channels.forEach(ch => selectedIds.add(ch.id));
            }
            window.YTSub.updateUI();
        });

        // Selection modal trigger
        document.querySelector("#yt-sub-selection-trigger")?.addEventListener("click", () => {
            if (state.selectedIds.size > 0) {
                state.selectionModalOpen = true;
                window.YTSub.updateUI();
            }
        });

        // Search
        document.querySelector("#yt-sub-search")?.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll(".yt-sub-item").forEach(item => {
                const name = item.querySelector(".yt-sub-name")?.textContent.toLowerCase();
                item.style.display = name?.includes(query) ? '' : 'none';
            });
        });

        // Channel selection
        document.querySelectorAll(".yt-sub-item").forEach(item => {
            item.addEventListener("click", (e) => {
                if (e.target.closest(".yt-sub-remove-selection")) return;

                const id = item.dataset.id;
                if (!id) return;

                if (state.selectedIds.has(id)) {
                    state.selectedIds.delete(id);
                } else {
                    state.selectedIds.add(id);
                }
                window.YTSub.updateUI();
            });
        });

        // New folder
        document.querySelector("#yt-sub-new-folder")?.addEventListener("click", () => {
            window.YTSub.folders?.createNewFolder();
        });

        // Dropdown toggle
        document.querySelector("[data-toggle-dropdown]")?.addEventListener("click", (e) => {
            e.stopPropagation();
            state.dropdownOpen = !state.dropdownOpen;
            state.exportDropdownOpen = false;
            window.YTSub.updateUI();
        });

        // Dropdown actions
        document.querySelector("[data-toggle-channels]")?.addEventListener("click", () => {
            state.showChannels = !state.showChannels;
            window.YTSub.folders?.saveVisibility();
            state.dropdownOpen = false;
            window.YTSub.updateUI();
        });

        document.querySelector("[data-toggle-folders]")?.addEventListener("click", () => {
            state.showFolders = !state.showFolders;
            window.YTSub.folders?.saveVisibility();
            state.dropdownOpen = false;
            window.YTSub.updateUI();
        });

        document.querySelector("[data-toggle-view]")?.addEventListener("click", () => {
            state.viewMode = state.viewMode === "sidebar" ? "modal" : "sidebar";
            window.YTSub.safeSetLocalStorage("yt-view-mode", state.viewMode);
            state.dropdownOpen = false;
            window.YTSub.updateUI();
        });

        document.querySelector("[data-toggle-position]")?.addEventListener("click", () => {
            state.sidebarPosition = state.sidebarPosition === "right" ? "left" : "right";
            window.YTSub.safeSetLocalStorage("yt-sidebar-position", state.sidebarPosition);
            state.dropdownOpen = false;
            window.YTSub.updateUI();
        });

        // Export dropdown
        document.querySelector("[data-toggle-export-dropdown]")?.addEventListener("click", (e) => {
            e.stopPropagation();
            state.exportDropdownOpen = !state.exportDropdownOpen;
            state.dropdownOpen = false;
            window.YTSub.updateUI();
        });

        // Export actions
        document.querySelectorAll("[data-export]").forEach(el => {
            el.addEventListener("click", () => {
                const format = el.getAttribute("data-export");
                window.YTSub.export?.exportChannels(format);
                state.exportDropdownOpen = false;
                window.YTSub.updateUI();
            });
        });

        // Backup/Restore
        document.querySelector("[data-backup-folders]")?.addEventListener("click", () => {
            window.YTSub.folders?.backupFolders();
            state.exportDropdownOpen = false;
            window.YTSub.updateUI();
        });

        document.querySelector("[data-restore-folders]")?.addEventListener("click", () => {
            window.YTSub.folders?.restoreFolders();
            state.exportDropdownOpen = false;
            window.YTSub.updateUI();
        });

        // Unsubscribe
        document.querySelector("#yt-sub-unsubscribe")?.addEventListener("click", () => {
            window.YTSub.dom?.bulkUnsubscribe();
        });

        // Close dropdowns on outside click
        document.addEventListener("click", (e) => {
            const clickedDropdown = e.target.closest(".yt-sub-dropdown");
            if (!clickedDropdown) {
                if (state.dropdownOpen || state.exportDropdownOpen) {
                    state.dropdownOpen = false;
                    state.exportDropdownOpen = false;
                    window.YTSub.updateUI();
                }
            }
        });

        // Show channels button
        document.querySelector("[data-show-channels]")?.addEventListener("click", () => {
            state.showChannels = true;
            window.YTSub.folders?.saveVisibility();
            window.YTSub.updateUI();
        });
    }

    // Export public API
    window.YTSub.events = {
        attachEvents,
    };
})();
