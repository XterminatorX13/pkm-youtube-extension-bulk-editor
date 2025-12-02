// 5-ui.js - UI rendering and HTML templates
; (() => {
  const { debugLog, showToast, updateUI, getChannelById, escapeHTML, icons } = window.YTSubUtils
  const state = window.YTSubState
  const { isOnChannelsPage, scrapeChannels, autoScrollAndLoad, bulkUnsubscribe } = window.YTSubDom || {}
  const { backupFolders, restoreFolders, deleteFolder } = window.YTSubFolders || {}
  const { exportChannels } = window.YTSubExport || {}
  const { t } = window.YTSubI18n

  // Helper: Get all folders that contain a specific channel
  function getChannelFolders(channelId) {
    return state.folders.filter(f => f.channels?.includes(channelId))
  }

  function renderFolderPreviewModal(folder) {
    const folderChannels = (folder.channels || []).map((id) => getChannelById(id)).filter(Boolean)

    return `
      <div class="yt-sub-folder-preview-modal" data-folder-preview="${folder.id}">
        <div class="yt-sub-folder-preview-content">
          <div class="yt-sub-folder-preview-header">
            <div class="yt-sub-folder-preview-title">
              <span class="yt-sub-folder-icon">${icons.folder}</span>
              ${escapeHTML(folder.name)}
              <span class="yt-sub-badge">${folderChannels.length}</span>
            </div>
            <button class="yt-sub-btn-icon" data-close-folder-preview title="${t('close')}">${icons.close}</button>
          </div>
          <div class="yt-sub-folder-preview-list">
            ${folderChannels.length === 0
        ? `<div class="yt-sub-empty-mini">${t('folder_empty')}</div>`
        : folderChannels
          .map(
            (ch) => `
                <div class="yt-sub-mini-item ${state.selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                  <div class="yt-sub-checkbox-mini ${state.selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
                  <img class="yt-sub-avatar-mini" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                  <span class="yt-sub-name-mini">${escapeHTML(ch.name)}</span>
                </div>
              `,
          )
          .join("")
      }
          </div>
          <div class="yt-sub-folder-preview-footer">
            <button class="yt-sub-btn yt-sub-btn-danger yt-sub-btn-sm" data-delete-folder="${folder.id}">
              ${icons.trash} ${t('delete_folder')}
            </button>
          </div>
        </div>
      </div>
    `
  }

  function renderFoldersModal() {
    return `
      <div class="yt-sub-folders-modal">
        <div class="yt-sub-folders-modal-content">
          <div class="yt-sub-folders-modal-header">
            <div class="yt-sub-folders-modal-title">
              ${icons.folder} ${t('my_folders')}
            </div>
            <button class="yt-sub-btn-icon" data-close-folders-modal title="${t('close')}">${icons.close}</button>
          </div>
          <div class="yt-sub-folders-modal-list">
            ${state.folders.length === 0
        ? `<div class="yt-sub-empty-mini">${t('no_folders')}</div>`
        : state.folders
          .map((f) => {
            const folderChannels = (f.channels || []).map((id) => getChannelById(id)).filter(Boolean)
            const previewChannels = folderChannels.slice(0, 4)
            return `
                  <div class="yt-sub-folder-card" data-open-folder-preview="${f.id}">
                    <div class="yt-sub-folder-card-header">
                      <span class="yt-sub-folder-icon">${icons.folder}</span>
                      <span class="yt-sub-folder-card-name">${escapeHTML(f.name)}</span>
                      <span class="yt-sub-badge">${folderChannels.length}</span>
                    </div>
                    <div class="yt-sub-folder-card-preview">
                      ${previewChannels.length === 0
                ? `<span class="yt-sub-folder-empty-text">${t('folder_empty')}</span>`
                : previewChannels
                  .map(
                    (ch) => `
                          <img class="yt-sub-folder-card-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="${escapeHTML(ch.name)}" title="${escapeHTML(ch.name)}" />
                        `,
                  )
                  .join("") +
                (
                  folderChannels.length > 4
                    ? `<span class="yt-sub-folder-more">+${folderChannels.length - 4}</span>`
                    : ""
                )
              }
                    </div>
                  </div>
                `
          })
          .join("")
      }
          </div>
        </div>
      </div>
    `
  }

  function renderSelectionModal() {
    const selectedChannels = state.channels.filter(c => state.selectedIds.has(c.id))

    return `
      <div class="yt-sub-selection-modal">
        <div class="yt-sub-folders-modal-content">
          <div class="yt-sub-folders-modal-header">
            <div class="yt-sub-folders-modal-title">
              ${icons.check} ${t('selected_title', { count: selectedChannels.length })}
            </div>
            <button class="yt-sub-btn-icon" data-close-selection-modal title="${t('close')}">${icons.close}</button>
          </div>
          <div class="yt-sub-folders-modal-list">
            ${selectedChannels.length === 0
        ? `<div class="yt-sub-empty-mini">${t('no_selection')}</div>`
        : selectedChannels
          .map(
            (ch) => `
                <div class="yt-sub-mini-item">
                  <img class="yt-sub-avatar-mini" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                  <span class="yt-sub-name-mini">${escapeHTML(ch.name)}</span>
                  <button class="yt-sub-btn-icon yt-sub-remove-selection" data-remove-id="${ch.id}" title="${t('remove_selection')}">
                    ${icons.close}
                  </button>
                </div>
              `,
          )
          .join("")
      }
          </div>
          <div class="yt-sub-folder-preview-footer">
            <button class="yt-sub-btn yt-sub-btn-danger yt-sub-btn-sm" id="yt-sub-clear-selection">
              ${t('clear_selection')}
            </button>
          </div>
        </div>
      </div>
    `
  }

  function renderDropdown() {
    return `
      <div class="yt-sub-dropdown" style="position: relative;">
        <button class="yt-sub-btn-icon" data-toggle-dropdown title="${t('settings')}">
          ${icons.settings}
        </button>
        ${state.dropdownOpen
        ? `
          <div class="yt-sub-dropdown-menu">
            <button class="yt-sub-dropdown-item" data-toggle-channels>
              ${state.showChannels ? icons.eyeOff : icons.eye} ${state.showChannels ? t('hide_channels') : t('show_channels')}
            </button>
            <button class="yt-sub-dropdown-item" data-toggle-folders>
              ${state.showFolders ? icons.eyeOff : icons.eye} ${state.showFolders ? t('hide_folders') : t('show_folders')}
            </button>
            <div class="yt-sub-dropdown-divider"></div>
            <button class="yt-sub-dropdown-item" data-toggle-view>
              ${state.viewMode === "sidebar" ? icons.expand : icons.list} ${state.viewMode === "sidebar" ? t('mode_modal') : t('mode_sidebar')}
            </button>
            ${state.viewMode === "sidebar" ? `
              <button class="yt-sub-dropdown-item" data-toggle-position>
                ${state.sidebarPosition === "right" ? "◀" : "▶"} ${state.sidebarPosition === "right" ? t('sidebar_left') : t('sidebar_right')}
              </button>
            ` : ""}
          </div>
          `
        : ""
      }
      </div>
      
      <div class="yt-sub-dropdown" style="position: relative;">
        <button class="yt-sub-btn-icon" data-toggle-export-dropdown title="${t('export_btn')}">
          ${icons.download}
        </button>
        ${state.exportDropdownOpen
        ? `
          <div class="yt-sub-dropdown-menu">
            <button class="yt-sub-dropdown-item" data-export="csv">
              ${icons.download} ${t('export_csv')}
            </button>
            <button class="yt-sub-dropdown-item" data-export="json">
              ${icons.download} ${t('export_json')}
            </button>
            <button class="yt-sub-dropdown-item" data-export="markdown">
              ${icons.download} ${t('export_md')}
            </button>
            <div class="yt-sub-dropdown-divider"></div>
            <button class="yt-sub-dropdown-item" data-backup-folders>
              💾 ${t('backup_folders')}
            </button>
            <button class="yt-sub-dropdown-item" data-restore-folders>
              📥 ${t('restore_folders')}
            </button>
          </div>
          `
        : ""
      }
      </div>
    `
  }

  function updateUIInternal() {
    let panel = document.querySelector("#yt-sub-panel")

    if (!state.panelOpen) {
      if (panel) panel.classList.remove("open")
      state.folderPreviewOpen = null
      state.foldersModalOpen = false
      state.dropdownOpen = false
      return
    }

    const contentDiv = document.querySelector(".yt-sub-content")
    if (contentDiv) {
      state.scrollPosition = contentDiv.scrollTop
    }

    if (!panel) {
      panel = document.createElement("div")
      panel.id = "yt-sub-panel"
      document.body.appendChild(panel)
    }

    const positionClass = state.viewMode === "sidebar" ? `yt-sub-position-${state.sidebarPosition}` : ""
    panel.className = `yt-sub-panel-${state.viewMode} ${positionClass}`
    panel.classList.add("open")

    const filtered = state.channels

    const dynamicClass = !state.showChannels && state.showFolders ? "compact" : ""

    // Use global Dom util if available, otherwise check window.location
    const notOnChannelsPage = window.YTSubDom ? !window.YTSubDom.isOnChannelsPage() : !window.location.href.includes("/feed/channels")

    const counterText = state.isAutoScrolling
      ? `${state.selectedIds.size}/${state.autoScrollProgress.found}...`
      : `${state.selectedIds.size}/${state.channels.length}`

    panel.innerHTML = `
      <div class="yt-sub-sidebar ${dynamicClass}">
        <div class="yt-sub-header">
          <div class="yt-sub-title">
            <span class="yt-sub-icon">${icons.youtube}</span>
            ${t('subscriptions')}
          </div>
          <div class="yt-sub-header-actions">
            ${renderDropdown()}
            <button class="yt-sub-btn-icon" id="yt-sub-close" title="${t('close')}">${icons.close}</button>
          </div>
        </div>

        <!-- Aviso quando não está na página correta -->
        ${notOnChannelsPage
        ? `
        <div class="yt-sub-warning">
          <span class="yt-sub-warning-icon">!</span>
          <div class="yt-sub-warning-text">
            <p>${t('warning_page')}</p>
            <a href="https://www.youtube.com/feed/channels" class="yt-sub-warning-link">
              ${icons.externalLink} youtube.com/feed/channels
            </a>
          </div>
        </div>
        `
        : ""
      }

        <div class="yt-sub-actions">
          <!-- Botão de reload com tooltip -->
          <button class="yt-sub-btn-icon ${state.isAutoScrolling ? "yt-sub-spinning" : ""}" id="yt-sub-refresh" title="${t('refresh_channels')}" ${state.isAutoScrolling ? "disabled" : ""}>
            ${state.isAutoScrolling ? icons.loader : icons.refresh}
          </button>
          
          <!-- Botão para carregar todos os canais via scroll -->
          ${!notOnChannelsPage
        ? `
          <button class="yt-sub-btn yt-sub-btn-sm yt-sub-btn-load ${state.isAutoScrolling ? "loading" : ""}" id="yt-sub-load-all" ${state.isAutoScrolling ? "disabled" : ""}>
            ${state.isAutoScrolling ? icons.loader : icons.download} 
            ${state.isAutoScrolling ? t('loading_progress', { current: state.autoScrollProgress.current, total: state.autoScrollProgress.total }) : t('load_all')}
          </button>
          `
        : ""
      }
          
          <button class="yt-sub-btn yt-sub-btn-pill yt-sub-btn-folders" id="yt-sub-open-folders">
            ${icons.folder} ${t('folders_btn')} <span class="yt-sub-badge-inline">${state.folders.length}</span>
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-select-all">
            ${state.selectedIds.size === filtered.length && filtered.length > 0 ? t('deselect_all') : t('select_all')}
          </button>
          <button class="yt-sub-count" id="yt-sub-selection-trigger" title="${t('selected_title', { count: state.selectedIds.size })}">
            ${counterText}
          </button>
        </div>

        <div class="yt-sub-search-wrap">
          <input type="text" class="yt-sub-search" placeholder="${t('search_placeholder')}" id="yt-sub-search" />
        </div>

        ${state.isProcessing || state.isAutoScrolling ? `<div class="yt-sub-status" id="yt-sub-status">${state.isAutoScrolling ? `${t('loading')} ${state.channels.length}` : t('processing')}</div>` : ""}

        <div class="yt-sub-content">
          <!-- Pastas (sem sticky para evitar bug de sobreposição) -->
          ${state.showFolders && state.folders.length > 0
        ? `
            <div class="yt-sub-section yt-sub-folders-section">
              <div class="yt-sub-section-title">${t('folders_btn')}</div>
              ${state.folders
          .map((f) => {
            const isExpanded = state.expandedFolders.has(f.id)
            const folderChannels = (f.channels || []).map((id) => getChannelById(id)).filter(Boolean)
            return `
                  <div class="yt-sub-folder ${isExpanded ? "expanded" : ""}" data-folder-id="${f.id}">
                    <div class="yt-sub-folder-header" data-toggle="${f.id}">
                      <span class="yt-sub-folder-chevron">${isExpanded ? icons.chevronDown : icons.chevronRight}</span>
                      <span class="yt-sub-folder-icon">${icons.folder}</span>
                      <span class="yt-sub-folder-name">${escapeHTML(f.name)}</span>
                      <span class="yt-sub-folder-badge">${folderChannels.length}</span>
                      <button class="yt-sub-btn-icon yt-sub-folder-delete" data-delete="${f.id}" title="${t('delete_folder')}">${icons.trash}</button>
                    </div>
                    ${isExpanded
                ? `
                      <div class="yt-sub-folder-content">
                        ${folderChannels.length === 0
                  ? `<div class="yt-sub-folder-empty">${t('folder_empty')}</div>`
                  : folderChannels
                    .map(
                      (ch) => `
                            <div class="yt-sub-item yt-sub-item-sm ${state.selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                              <div class="yt-sub-checkbox ${state.selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
                              <img class="yt-sub-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                              <span class="yt-sub-name">${escapeHTML(ch.name)}</span>
                            </div>
                          `,
                    )
                    .join("")
                }
                      </div>
                    `
                : ""
              }
                  </div>
                `
          })
          .join("")}
            </div>
          `
        : ""
      }

          <!-- Todos os canais -->
          ${state.showChannels
        ? `
            <div class="yt-sub-section">
              <div class="yt-sub-section-title">Todos os canais (${filtered.length})</div>
              ${filtered.length === 0
          ? `<div class="yt-sub-empty">${t('empty_channels')}</div>`
          : filtered
            .map(
              (ch) => `
                  <div class="yt-sub-item ${state.selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                    <div class="yt-sub-checkbox ${state.selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
                    <img class="yt-sub-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                    <div class="yt-sub-info">
                      <span class="yt-sub-name">${escapeHTML(ch.name)}</span>
                      ${ch.subscribers ? `<span class="yt-sub-subs">${escapeHTML(ch.subscribers)}</span>` : ""}
                    </div>
                    ${getChannelFolders(ch.id).length > 0 ? `
                      <div class="yt-sub-folder-tags">
                        ${getChannelFolders(ch.id).map(folder => `
                          <span class="yt-sub-folder-tag" data-folder-id="${folder.id}" title="Clique para ver pasta">
                            📁 ${escapeHTML(folder.name)}
                          </span>
                        `).join('')}
                      </div>
                    ` : ''}
                    ${ch.href ? `<a href="${ch.href}" target="_blank" class="yt-sub-channel-link" title="Abrir canal" onclick="event.stopPropagation()">${icons.externalLink}</a>` : ""}
                  </div>
                `,
            )
            .join("")
        }
            </div>
          `
        : `
            <div class="yt-sub-channels-hidden">
              ${icons.eyeOff}
              <span>${t('channels_hidden')}</span>
              <button class="yt-sub-btn yt-sub-btn-sm" data-show-channels>${t('show_channels')}</button>
            </div>
          `
      }
        </div>

        <div class="yt-sub-footer">
          <button class="yt-sub-btn yt-sub-btn-folder" id="yt-sub-new-folder" ${state.selectedIds.size === 0 ? "disabled" : ""}>
            ${icons.plus} ${t('new_folder')}
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-unsubscribe" ${state.selectedIds.size === 0 || state.isProcessing ? "disabled" : ""}>
            ${icons.trash} ${t('unsubscribe_btn', { count: state.selectedIds.size })}
          </button>
        </div>
      </div>

      ${state.foldersModalOpen ? renderFoldersModal() : ""}
      ${state.folderPreviewOpen ? renderFolderPreviewModal(state.folders.find((f) => f.id === state.folderPreviewOpen)) : ""}
      ${state.selectionModalOpen ? renderSelectionModal() : ""}
    `

    // Restaurar scroll
    const newContentDiv = document.querySelector(".yt-sub-content")
    if (newContentDiv && state.scrollPosition > 0) {
      setTimeout(() => {
        newContentDiv.scrollTop = state.scrollPosition
      }, 10)
    }

    // Event Listeners - Call global event attacher if available
    if (window.YTSubEvents && window.YTSubEvents.attachEventListeners) {
      window.YTSubEvents.attachEventListeners()
    }
  }

  // Lightweight update: only update selection states without full re-render
  function updateSelectionOnly() {
    const counterText = state.isAutoScrolling
      ? `${state.selectedIds.size}/${state.autoScrollProgress.found}...`
      : `${state.selectedIds.size}/${state.channels.length}`

    // Update counter
    const counterEl = document.querySelector("#yt-sub-selection-trigger")
    if (counterEl) {
      counterEl.textContent = counterText
    }

    // Update all checkboxes and item states
    document.querySelectorAll(".yt-sub-item[data-id]").forEach((el) => {
      const id = el.getAttribute("data-id")
      const isSelected = state.selectedIds.has(id)
      const checkbox = el.querySelector(".yt-sub-checkbox")

      if (isSelected) {
        el.classList.add("selected")
        if (checkbox) checkbox.classList.add("checked")
      } else {
        el.classList.remove("selected")
        if (checkbox) checkbox.classList.remove("checked")
      }
    })

    // Update mini items (in folder preview)
    document.querySelectorAll(".yt-sub-mini-item[data-id]").forEach((el) => {
      const id = el.getAttribute("data-id")
      const isSelected = state.selectedIds.has(id)
      const checkbox = el.querySelector(".yt-sub-checkbox-mini")

      if (isSelected) {
        el.classList.add("selected")
        if (checkbox) checkbox.classList.add("checked")
      } else {
        el.classList.remove("selected")
        if (checkbox) checkbox.classList.remove("checked")
      }
    })

    // Update select all button text
    const selectAllBtn = document.querySelector("#yt-sub-select-all")
    if (selectAllBtn) {
      const filtered = state.channels
      selectAllBtn.textContent = state.selectedIds.size === filtered.length && filtered.length > 0
        ? (window.YTSubI18n?.t('deselect_all') || 'Deselect All')
        : (window.YTSubI18n?.t('select_all') || 'Select All')
    }

    // Update unsubscribe button state
    const unsubBtn = document.querySelector("#yt-sub-unsubscribe")
    if (unsubBtn) {
      unsubBtn.disabled = state.selectedIds.size === 0 || state.isProcessing
    }

    // Update new folder button state
    const newFolderBtn = document.querySelector("#yt-sub-new-folder")
    if (newFolderBtn) {
      newFolderBtn.disabled = state.selectedIds.size === 0
    }
  }


  // Export to global for debounced call in main.js
  window.YTSubUpdateUIInternal = updateUIInternal

  // Also export render functions if needed elsewhere
  window.YTSubUI = {
    renderFolderPreviewModal,
    renderFoldersModal,
    renderSelectionModal,
    renderDropdown,
    updateUIInternal,
    updateSelectionOnly
  }
})()
