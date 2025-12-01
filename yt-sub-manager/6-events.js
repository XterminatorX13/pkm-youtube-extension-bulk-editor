// 6-events.js - Event listeners
; (() => {
    const { debugLog, showToast, updateUI, saveFolders, saveVisibility, createNewFolder, safeSetLocalStorage } = window.YTSubUtils
    const state = window.YTSubState
    const { scrapeChannels, autoScrollAndLoad, bulkUnsubscribe } = window.YTSubDom || {}
    const { backupFolders, restoreFolders } = window.YTSubFolders || {}
    const { exportChannels, exportCSV } = window.YTSubExport || {}

    function attachEventListeners() {
        // Close button
        document.querySelector("#yt-sub-close")?.addEventListener("click", () => {
            state.panelOpen = false
            updateUI()
        })

        // Refresh
        document.querySelector("#yt-sub-refresh")?.addEventListener("click", () => {
            if (!state.isAutoScrolling) {
                state.channels = []
                if (window.YTSubDom && window.YTSubDom.scrapeChannels) {
                    window.YTSubDom.scrapeChannels()
                }
                updateUI()
                showToast(`${state.channels.length} canais carregados`)
            }
        })

        // Load all (auto-scroll)
        document.querySelector("#yt-sub-load-all")?.addEventListener("click", () => {
            if (!state.isAutoScrolling && window.YTSubDom && window.YTSubDom.autoScrollAndLoad) {
                window.YTSubDom.autoScrollAndLoad(20)
            }
        })

        // Open folders modal
        document.querySelector("#yt-sub-open-folders")?.addEventListener("click", () => {
            state.foldersModalOpen = true
            updateUI()
        })

        // Close folders modal
        document.querySelector("[data-close-folders-modal]")?.addEventListener("click", () => {
            state.foldersModalOpen = false
            updateUI()
        })

        // Open folder preview from modal
        document.querySelectorAll("[data-open-folder-preview]").forEach((el) => {
            el.addEventListener("click", () => {
                state.folderPreviewOpen = el.getAttribute("data-open-folder-preview")
                updateUI()
            })
        })

        // Close folder preview
        document.querySelector("[data-close-folder-preview]")?.addEventListener("click", () => {
            state.folderPreviewOpen = null
            updateUI()
        })

        // Export CSV (Legacy ID but using new function)
        document.querySelector("#yt-sub-export-csv")?.addEventListener("click", () => {
            if (exportCSV) exportCSV()
        })

        // Selection Modal Trigger
        document.querySelector("#yt-sub-selection-trigger")?.addEventListener("click", () => {
            if (state.selectedIds.size > 0) {
                state.selectionModalOpen = true
                updateUI()
            }
        })

        // Close Selection Modal
        document.querySelector("[data-close-selection-modal]")?.addEventListener("click", () => {
            state.selectionModalOpen = false
            updateUI()
        })

        // Clear Selection
        document.querySelector("#yt-sub-clear-selection")?.addEventListener("click", () => {
            state.selectedIds.clear()
            state.selectionModalOpen = false
            updateUI()
        })

        // Remove item from selection modal
        document.querySelectorAll(".yt-sub-remove-selection").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = btn.getAttribute("data-remove-id")
                state.selectedIds.delete(id)
                if (state.selectedIds.size === 0) state.selectionModalOpen = false
                updateUI()
            })
        })

        // Delete folder from preview
        document.querySelectorAll("[data-delete-folder]").forEach((el) => {
            el.addEventListener("click", (e) => {
                e.stopPropagation()
                const folderId = el.getAttribute("data-delete-folder")
                if (window.YTSubFolders && window.YTSubFolders.deleteFolder) {
                    window.YTSubFolders.deleteFolder(folderId)
                }
            })
        })

        // Select all
        document.querySelector("#yt-sub-select-all")?.addEventListener("click", () => {
            if (state.selectedIds.size === state.channels.length && state.channels.length > 0) {
                state.selectedIds.clear()
            } else {
                state.channels.forEach((ch) => state.selectedIds.add(ch.id))
            }
            updateUI()
        })

        // Search
        document.querySelector("#yt-sub-search")?.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase()
            document.querySelectorAll(".yt-sub-item").forEach((el) => {
                const name = el.querySelector(".yt-sub-name")?.textContent?.toLowerCase() || ""
                el.style.display = name.includes(query) ? "" : "none"
            })
        })

        // Toggle dropdown
        document.querySelector("[data-toggle-dropdown]")?.addEventListener("click", (e) => {
            e.stopPropagation()
            state.dropdownOpen = !state.dropdownOpen
            updateUI()
        })

        // Dropdown options
        document.querySelector("[data-toggle-channels]")?.addEventListener("click", () => {
            state.showChannels = !state.showChannels
            saveVisibility()
            state.dropdownOpen = false
            updateUI()
        })

        document.querySelector("[data-toggle-folders]")?.addEventListener("click", () => {
            state.showFolders = !state.showFolders
            saveVisibility()
            state.dropdownOpen = false
            updateUI()
        })

        document.querySelector("[data-toggle-view]")?.addEventListener("click", () => {
            state.viewMode = state.viewMode === "sidebar" ? "modal" : "sidebar"
            safeSetLocalStorage("yt-view-mode", state.viewMode)
            state.dropdownOpen = false
            updateUI()
        })

        document.querySelector("[data-show-channels]")?.addEventListener("click", () => {
            state.showChannels = true
            saveVisibility()
            updateUI()
        })

        // Folder expand/collapse
        document.querySelectorAll("[data-toggle]").forEach((el) => {
            el.addEventListener("click", (e) => {
                const folderId = el.getAttribute("data-toggle")
                if (state.expandedFolders.has(folderId)) {
                    state.expandedFolders.delete(folderId)
                } else {
                    state.expandedFolders.add(folderId)
                }
                updateUI()
            })
        })

        // Folder delete (from list)
        document.querySelectorAll("[data-delete]").forEach((el) => {
            el.addEventListener("click", (e) => {
                e.stopPropagation()
                const folderId = el.getAttribute("data-delete")
                if (window.YTSubFolders && window.YTSubFolders.deleteFolder) {
                    window.YTSubFolders.deleteFolder(folderId)
                }
            })
        })

        // Channel selection
        document.querySelectorAll(".yt-sub-item[data-id]").forEach((el) => {
            el.addEventListener("click", () => {
                const id = el.getAttribute("data-id")
                if (state.selectedIds.has(id)) {
                    state.selectedIds.delete(id)
                } else {
                    state.selectedIds.add(id)
                }
                updateUI()
            })
        })

        // Mini item selection (APENAS para folder preview - não altera seleção, só visualiza)
        document.querySelectorAll(".yt-sub-mini-item[data-id]").forEach((el) => {
            el.addEventListener("click", () => {
                const id = el.getAttribute("data-id")
                // Mini items apenas toggleiam a seleção visualmente
                if (state.selectedIds.has(id)) {
                    state.selectedIds.delete(id)
                } else {
                    state.selectedIds.add(id)
                }
                updateUI()
            })
        })

        // New folder
        document.querySelector("#yt-sub-new-folder")?.addEventListener("click", createNewFolder)

        // Export formats
        // Export dropdown toggle
        document.querySelector("[data-toggle-export-dropdown]")?.addEventListener("click", (e) => {
            e.stopPropagation()
            state.exportDropdownOpen = !state.exportDropdownOpen
            state.dropdownOpen = false  // Close other dropdown
            updateUI()
        })

        // Export actions
        document.querySelectorAll("[data-export]").forEach(el => {
            el.addEventListener("click", () => {
                const format = el.getAttribute("data-export")
                if (exportChannels) exportChannels(format)
                state.exportDropdownOpen = false
                updateUI()
            })
        })

        // Backup/Restore from dropdown
        document.querySelector("[data-backup-folders]")?.addEventListener("click", () => {
            if (backupFolders) backupFolders()
            state.exportDropdownOpen = false
            updateUI()
        })
        document.querySelector("[data-restore-folders]")?.addEventListener("click", () => {
            if (restoreFolders) restoreFolders()
            state.exportDropdownOpen = false
            updateUI()
        })

        // Sidebar position toggle
        document.querySelector("[data-toggle-position]")?.addEventListener("click", () => {
            state.sidebarPosition = state.sidebarPosition === "right" ? "left" : "right"
            safeSetLocalStorage("yt-sidebar-position", state.sidebarPosition)
            state.dropdownOpen = false
            updateUI()
        })

        // Unsubscribe
        document.querySelector("#yt-sub-unsubscribe")?.addEventListener("click", () => {
            if (bulkUnsubscribe) bulkUnsubscribe()
        })

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            const clickedDropdown = e.target.closest(".yt-sub-dropdown")
            if (!clickedDropdown) {
                if (state.dropdownOpen || state.exportDropdownOpen) {
                    state.dropdownOpen = false
                    state.exportDropdownOpen = false
                    updateUI()
                }
            }
        })
    }

    window.YTSubEvents = {
        attachEventListeners
    }
})()
