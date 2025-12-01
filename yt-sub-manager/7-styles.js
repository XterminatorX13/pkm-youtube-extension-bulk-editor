// 7-styles.js - CSS injection, Floating Action Button, and Initialization
; (() => {
  const { debugLog, showToast, updateUI, icons } = window.YTSubUtils
  const state = window.YTSubState
  const { scrapeChannels, isOnChannelsPage } = window.YTSubDom || {}

  function createFAB() {
    if (document.querySelector("#yt-sub-fab")) return

    const fab = document.createElement("button")
    fab.id = "yt-sub-fab"
    fab.innerHTML = icons.grid
    fab.title = "Gerenciar Inscrições"

    fab.addEventListener("click", () => {
      state.panelOpen = !state.panelOpen
      if (state.panelOpen && state.channels.length === 0) {
        if (scrapeChannels) scrapeChannels()
      }
      updateUI()
    })

    document.body.appendChild(fab)
  }

  function injectStyles() {
    if (document.querySelector("#yt-sub-styles")) return

    const style = document.createElement("style")
    style.id = "yt-sub-styles"
    style.textContent = `
      #yt-sub-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        background: #ff0000;
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      #yt-sub-fab:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(0,0,0,0.4); }
      #yt-sub-fab svg { width: 22px; height: 22px; }

      #yt-sub-panel {
        position: fixed;
        z-index: 10000;
        font-family: "Roboto", "Arial", sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      #yt-sub-panel.open { opacity: 1; visibility: visible; }

      /* Sidebar mode - Right */
      #yt-sub-panel.yt-sub-panel-sidebar.yt-sub-position-right {
        top: 0;
        right: 0;
        bottom: 0;
        width: 360px;
        max-width: 100vw;
      }
      #yt-sub-panel.yt-sub-panel-sidebar.yt-sub-position-right .yt-sub-sidebar {
        height: 100%;
        border-left: 1px solid #272727;
      }

      /* Sidebar mode - Left */
      #yt-sub-panel.yt-sub-panel-sidebar.yt-sub-position-left {
        top: 0;
        left: 0;
        bottom: 0;
        width: 360px;
        max-width: 100vw;
      }
      #yt-sub-panel.yt-sub-panel-sidebar.yt-sub-position-left .yt-sub-sidebar {
        height: 100%;
        border-right: 1px solid #272727;
      }

      /* Modal mode - Centered */
      #yt-sub-panel.yt-sub-panel-modal {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.7);
        padding: 20px;
      }
      #yt-sub-panel.yt-sub-panel-modal .yt-sub-sidebar {
        width: 420px;
        max-width: 100%;
        max-height: 85vh;
        border-radius: 12px;
        border: 1px solid #272727;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      }
      
      /* Compact mode quando canais estão ocultos */
      .yt-sub-sidebar.compact {
        max-height: 400px;
      }
      #yt-sub-panel.yt-sub-panel-modal .yt-sub-sidebar.compact {
        height: auto;
      }

      .yt-sub-sidebar {
        background: #0f0f0f;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Warning box */
      .yt-sub-warning {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #3d2c00 0%, #2d2000 100%);
        border-bottom: 1px solid #5c4600;
      }
      .yt-sub-warning-icon {
        width: 24px;
        height: 24px;
        background: #f59e0b;
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        flex-shrink: 0;
      }
      .yt-sub-warning-text {
        flex: 1;
      }
      .yt-sub-warning-text p {
        color: #fbbf24;
        font-size: 12px;
        margin: 0 0 8px 0;
      }
      .yt-sub-warning-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #3ea6ff;
        font-size: 13px;
        text-decoration: none;
        padding: 6px 12px;
        background: rgba(62,166,255,0.1);
        border-radius: 16px;
        transition: background 0.2s;
      }
      .yt-sub-warning-link:hover {
        background: rgba(62,166,255,0.2);
      }
      .yt-sub-warning-link svg {
        width: 14px;
        height: 14px;
      }

      /* Header */
      .yt-sub-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #0f0f0f;
        border-bottom: 1px solid #272727;
      }
      .yt-sub-header-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .yt-sub-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #f1f1f1;
        font-size: 16px;
        font-weight: 500;
      }
      .yt-sub-icon { color: #ff0000; display: flex; }
      .yt-sub-icon svg { width: 20px; height: 20px; }

      /* Buttons */
      .yt-sub-btn-icon {
        background: none;
        border: none;
        color: #aaa;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s;
      }
      .yt-sub-btn-icon:hover { background: #272727; color: #f1f1f1; }
      .yt-sub-btn-icon:disabled { opacity: 0.5; cursor: not-allowed; }
      .yt-sub-btn-icon svg { width: 18px; height: 18px; }

      /* Animação de spinning para o loader */
      .yt-sub-btn-icon.yt-sub-spinning svg {
        animation: yt-sub-spin 1s linear infinite;
      }
      @keyframes yt-sub-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .yt-sub-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border-radius: 18px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        background: #272727;
        color: #f1f1f1;
        transition: background 0.2s, transform 0.1s;
      }
      .yt-sub-btn:hover { background: #3f3f3f; transform: translateY(-1px); }
      .yt-sub-btn:active { transform: translateY(0); }
      .yt-sub-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }
      .yt-sub-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
      
      .yt-sub-btn-xs {
        padding: 5px 10px;
        font-size: 12px;
        gap: 4px;
      }
      .yt-sub-btn-xs svg { width: 12px; height: 12px; }

      .yt-sub-btn-sm { padding: 6px 12px; font-size: 12px; }
      .yt-sub-btn-sm svg { width: 13px; height: 13px; }

      /* Botão de carregar todos */
      .yt-sub-btn-load {
        background: #1a472a;
        color: #4ade80;
      }
      .yt-sub-btn-load:hover:not(:disabled) {
        background: #22633b;
      }
      .yt-sub-btn-load.loading {
        background: #1a472a;
      }
      .yt-sub-btn-load.loading svg {
        animation: yt-sub-spin 1s linear infinite;
      }

      /* Botão pílula para pastas */
      .yt-sub-btn-pill {
        border-radius: 20px;
        padding: 6px 12px;
        background: #263850;
        color: #3ea6ff;
      }
      .yt-sub-btn-pill:hover:not(:disabled) { background: #2d4a6a; }
      .yt-sub-badge-inline {
        background: rgba(62,166,255,0.2);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        margin-left: 2px;
      }

      .yt-sub-btn-folder { background: #263850; color: #3ea6ff; }
      .yt-sub-btn-folder:hover:not(:disabled) { background: #2d4a6a; }
      .yt-sub-btn-danger { background: #3d1519; color: #ff4e45; }
      .yt-sub-btn-danger:hover:not(:disabled) { background: #5c1f24; }

      /* Actions Bar */
      .yt-sub-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-bottom: 1px solid #272727;
        flex-wrap: wrap;
      }
      .yt-sub-count {
        color: #aaa;
        font-size: 12px;
        margin-left: auto;
        background: #272727;
        padding: 4px 8px;
        border-radius: 10px;
      }

      /* Dropdown de opções */
      .yt-sub-dropdown {
        position: relative;
      }
      .yt-sub-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: #212121;
        border: 1px solid #3f3f3f;
        border-radius: 8px;
        padding: 4px 0;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        z-index: 2000;
        margin-top: 4px;
      }
      .yt-sub-dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        color: #f1f1f1;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        font-family: inherit;
        box-sizing: border-box;
      }
      .yt-sub-dropdown-item:hover { background: #3f3f3f; }
      .yt-sub-dropdown-item svg { width: 16px; height: 16px; color: #aaa; flex-shrink: 0; }
      .yt-sub-dropdown-divider {
        height: 1px;
        background: #3f3f3f;
        margin: 4px 0;
      }

      /* Search */
      .yt-sub-search-wrap { padding: 8px 16px; }
      .yt-sub-search {
        width: 100%;
        background: #121212;
        border: 1px solid #272727;
        border-radius: 8px;
        padding: 8px 12px;
        color: #f1f1f1;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      }
      .yt-sub-search:focus { border-color: #3ea6ff; }
      .yt-sub-search::placeholder { color: #717171; }

      /* Status */
      .yt-sub-status {
        padding: 8px 16px;
        background: #1a365d;
        color: #63b3ed;
        font-size: 12px;
        text-align: center;
      }

      /* Content */
      .yt-sub-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
      .yt-sub-section { padding: 0 8px; margin-bottom: 8px; }
      .yt-sub-section-title {
        color: #aaa;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
        padding: 8px;
        letter-spacing: 0.5px;
      }
      
      /* Mensagem quando canais estão ocultos */
      .yt-sub-channels-hidden {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        color: #717171;
        text-align: center;
        gap: 12px;
      }
      .yt-sub-channels-hidden svg {
        width: 24px;
        height: 24px;
        margin-bottom: 4px;
      }

      /* Folders - removido sticky para evitar bug de sobreposição */
      .yt-sub-folders-section {
        background: #0f0f0f;
        padding-bottom: 8px;
        border-bottom: 1px solid #272727;
        margin-bottom: 8px;
      }
      .yt-sub-folder { margin-bottom: 2px; border-radius: 8px; overflow: hidden; }
      .yt-sub-folder-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.2s;
      }
      .yt-sub-folder-header:hover { background: #272727; }
      .yt-sub-folder-chevron { color: #717171; display: flex; }
      .yt-sub-folder-chevron svg { width: 16px; height: 16px; }
      .yt-sub-folder-icon { color: #3ea6ff; display: flex; }
      .yt-sub-folder-icon svg { width: 18px; height: 18px; }
      .yt-sub-folder-name { flex: 1; color: #f1f1f1; font-size: 14px; }
      .yt-sub-folder-badge {
        background: #272727;
        color: #aaa;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
      }
      .yt-sub-folder-delete {
        opacity: 0;
        transition: opacity 0.2s;
      }
      .yt-sub-folder-header:hover .yt-sub-folder-delete { opacity: 1; }
      .yt-sub-folder-content {
        padding: 4px 0 4px 24px;
        background: #181818;
        border-radius: 0 0 8px 8px;
      }
      .yt-sub-folder-empty {
        color: #717171;
        font-size: 12px;
        padding: 8px 12px;
      }

      /* Channel items */
      .yt-sub-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 8px;
        margin: 2px 8px;
        transition: background 0.15s;
      }
      .yt-sub-item:hover { background: #272727; }
      .yt-sub-item.selected { background: #1a3a5c; }
      .yt-sub-item-sm { padding: 6px 10px; margin: 1px 4px; }

      .yt-sub-checkbox {
        width: 18px;
        height: 18px;
        border: 2px solid #717171;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .yt-sub-checkbox svg { width: 12px; height: 12px; opacity: 0; }
      .yt-sub-checkbox.checked {
        background: #3ea6ff;
        border-color: #3ea6ff;
      }
      .yt-sub-checkbox.checked svg { opacity: 1; color: #000; }

      .yt-sub-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }
      .yt-sub-item-sm .yt-sub-avatar { width: 28px; height: 28px; }

      .yt-sub-info { flex: 1; min-width: 0; }
      .yt-sub-name {
        color: #f1f1f1;
        font-size: 14px;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .yt-sub-item-sm .yt-sub-name { font-size: 13px; }
      .yt-sub-subs {
        color: #aaa;
        font-size: 11px;
      }

      .yt-sub-channel-link {
        color: #3ea6ff;
        text-decoration: none;
        padding: 6px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s;
        opacity: 0;
      }
      .yt-sub-channel-link svg {
        width: 14px;
        height: 14px;
      }
      .yt-sub-item:hover .yt-sub-channel-link {
        opacity: 1;
      }
      .yt-sub-channel-link:hover {
        background: rgba(62,166,255,0.1);
        color: #63b3ed;
      }

      .yt-sub-empty {
        color: #717171;
        font-size: 13px;
        padding: 24px 16px;
        text-align: center;
      }

      /* Footer */
      .yt-sub-footer {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #272727;
        background: #0f0f0f;
      }
      .yt-sub-footer .yt-sub-btn { flex: 1; justify-content: center; }

      /* Toast */
      .yt-sub-toast {
        position: fixed;
        bottom: 80px;
        right: 24px;
        background: #323232;
        color: #f1f1f1;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s;
        pointer-events: none;
      }
      .yt-sub-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      /* Folders modal */
      .yt-sub-folders-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        padding: 20px;
      }
      .yt-sub-folders-modal-content {
        background: #212121;
        border-radius: 12px;
        width: 400px;
        max-width: 100%;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .yt-sub-folders-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid #3f3f3f;
      }
      .yt-sub-folders-modal-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #f1f1f1;
        font-size: 16px;
        font-weight: 500;
      }
      .yt-sub-folders-modal-title svg {
        width: 20px;
        height: 20px;
        color: #3ea6ff;
      }
      .yt-sub-folders-modal-list {
        padding: 12px;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .yt-sub-folder-card {
        background: #181818;
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .yt-sub-folder-card:hover { background: #272727; }
      .yt-sub-folder-card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      .yt-sub-folder-card-name {
        flex: 1;
        color: #f1f1f1;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .yt-sub-folder-card-preview {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .yt-sub-folder-card-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        margin-left: -8px;
        border: 2px solid #181818;
      }
      .yt-sub-folder-card-avatar:first-child { margin-left: 0; }
      .yt-sub-folder-more {
        color: #aaa;
        font-size: 11px;
        margin-left: 4px;
      }
      .yt-sub-folder-empty-text {
        color: #717171;
        font-size: 12px;
      }
      .yt-sub-badge {
        background: #3f3f3f;
        color: #aaa;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 10px;
      }

      /* Folder preview modal */
      .yt-sub-folder-preview-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
        padding: 20px;
      }
      .yt-sub-folder-preview-content {
        background: #212121;
        border-radius: 12px;
        width: 320px;
        max-width: 100%;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .yt-sub-folder-preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid #3f3f3f;
      }
      .yt-sub-folder-preview-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f1f1f1;
        font-size: 14px;
        font-weight: 500;
      }
      .yt-sub-folder-preview-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }
      .yt-sub-mini-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .yt-sub-mini-item:hover { background: #272727; }
      .yt-sub-mini-item.selected { background: #1a3a5c; }
      .yt-sub-checkbox-mini {
        width: 16px;
        height: 16px;
        border: 2px solid #717171;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .yt-sub-checkbox-mini svg { width: 10px; height: 10px; opacity: 0; }
      .yt-sub-checkbox-mini.checked {
        background: #3ea6ff;
        border-color: #3ea6ff;
      }
      .yt-sub-checkbox-mini.checked svg { opacity: 1; color: #000; }
      .yt-sub-avatar-mini {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
      }
      .yt-sub-name-mini {
        color: #f1f1f1;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .yt-sub-folder-preview-footer {
        padding: 12px;
        border-top: 1px solid #3f3f3f;
        display: flex;
        justify-content: center;
      }
      .yt-sub-empty-mini {
        color: #717171;
        font-size: 13px;
        padding: 24px;
        text-align: center;
      }

      /* Progress Overlay */
      .yt-sub-progress-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10005;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      .yt-sub-progress-box {
        background: #212121;
        padding: 30px;
        border-radius: 12px;
        width: 400px;
        text-align: center;
        border: 1px solid #3f3f3f;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      }
      .yt-sub-progress-box h3 { margin: 0 0 15px 0; color: #fff; }
      .yt-sub-progress-text { margin-bottom: 20px; color: #aaa; line-height: 1.5; }
      .yt-sub-progress-bar-bg {
        background: #3f3f3f;
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        margin-bottom: 20px;
      }
      .yt-sub-progress-bar-fill {
        background: #ff4e45;
        height: 100%;
        transition: width 0.3s;
      }

      /* Interactive Counter */
      .yt-sub-count {
        background: none;
        border: none;
        color: #aaa;
        font-size: 12px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 12px;
        transition: background 0.2s, color 0.2s;
      }
      .yt-sub-count:hover {
        background: #3f3f3f;
        color: #fff;
      }

      .yt-sub-remove-selection {
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      .yt-sub-remove-selection:hover {
        opacity: 1;
        color: #ff4e45;
      }
    `
    document.head.appendChild(style)
  }

  // Inicialização
  function init() {
    console.log("[v0] Inicializando extensão...")
    injectStyles()
    createFAB()

    // Scrape inicial se estiver na página certa
    if (isOnChannelsPage && isOnChannelsPage()) {
      setTimeout(() => {
        if (scrapeChannels) {
          scrapeChannels()
          console.log("[v0] Canais iniciais:", state.channels.length)
        }
      }, 1500)
    }
  }

  // Aguarda DOM carregar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }

  // Observer para detectar navegação SPA do YouTube
  let lastUrl = location.href
  new MutationObserver(() => {
    const url = location.href
    if (url !== lastUrl) {
      lastUrl = url
      console.log("[v0] URL mudou:", url)
      // Reset channels quando muda de página
      if (!url.includes("/feed/channels")) {
        state.channels = []
      } else {
        setTimeout(() => {
          if (scrapeChannels) scrapeChannels()
        }, 1500)
      }
      if (state.panelOpen) updateUI()
    }
  }).observe(document, { subtree: true, childList: true })
})()
