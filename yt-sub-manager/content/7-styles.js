// 7-styles.js - CSS injection + Icons (~500 lines)
(() => {
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
        expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    };

    function inject() {
        if (document.querySelector("#yt-sub-styles")) return;

        const style = document.createElement("style");
        style.id = "yt-sub-styles";
        style.textContent = `
      /* FAB */
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

      /* Panel */
      #yt-sub-panel {
        position: fixed;
        z-index: 10000;
        font-family: "Roboto", "Arial", sans-serif;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      #yt-sub-panel.open { opacity: 1; visibility: visible; }

      /* Sidebar - Right */
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

      /* Sidebar - Left */
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

      /* Modal */
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

      .yt-sub-sidebar {
        background: #0f0f0f;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      /* Toast */
      .yt-sub-toast {
        position: fixed;
        bottom: 90px;
        right: 30px;
        background: #323232;
        color: #f1f1f1;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

      /* Progress Overlay */
      .yt-sub-progress-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
      }
      .yt-sub-progress-box {
        background: #212121;
        padding: 24px;
        border-radius: 12px;
        min-width: 300px;
        text-align: center;
      }
      .yt-sub-progress-box h3 {
        color: #f1f1f1;
        margin: 0 0 16px 0;
      }
      .yt-sub-progress-text {
        color: #aaa;
        margin: 12px 0;
        font-size: 14px;
      }
      .yt-sub-progress-bar-bg {
        background: #3f3f3f;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        margin: 16px 0;
      }
      .yt-sub-progress-bar-fill {
        background: #3ea6ff;
        height: 100%;
        transition: width 0.3s;
      }

      /* Buttons */
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
      .yt-sub-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .yt-sub-btn svg { width: 14px; height: 14px; }

      .yt-sub-btn-xs { padding: 5px 10px; font-size: 12px; }
      .yt-sub-btn-xs svg { width: 12px; height: 12px; }

      .yt-sub-btn-sm { padding: 6px 12px; font-size: 12px; }

      .yt-sub-btn-danger {
        background: #c70000;
        color: white;
      }
      .yt-sub-btn-danger:hover { background: #a00000; }

      .yt-sub-btn-folder {
        background: #3f3f3f;
        color: #3ea6ff;
      }
      .yt-sub-btn-folder:hover { background: #065fd4; color: white; }

      /* Dropdown */
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
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 100;
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
        border: none;
        background: none;
        width: 100%;
        text-align: left;
        transition: background 0.2s;
      }
      .yt-sub-dropdown-item:hover { background: #3f3f3f; }
      .yt-sub-dropdown-item svg { width: 16px; height: 16px; }

      .yt-sub-dropdown-divider {
        height: 1px;
        background: #3f3f3f;
        margin: 4px 0;
      }

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

      .yt-sub-btn-icon.yt-sub-spinning svg {
        animation: yt-sub-spin 1s linear infinite;
      }
      @keyframes yt-sub-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* More CSS would go here... */
    `;

        document.head.appendChild(style);
    }

    window.YTSub.icons = icons;
    window.YTSub.styles = { inject };
})();
