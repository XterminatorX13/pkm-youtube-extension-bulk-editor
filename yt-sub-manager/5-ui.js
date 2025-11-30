// 5-ui.js - UI rendering (~450 lines)
// Note: This is a simplified version. Full implementation would include all modals and components.
(() => {
    const { state, icons = {} } = window.YTSub;

    function escapeHTML(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render() {
        const { panelOpen, channels, folders, selectedIds, viewMode, sidebarPosition } = state;

        if (!panelOpen) {
            const panel = document.querySelector("#yt-sub-panel");
            if (panel) panel.classList.remove("open");
            return;
        }

        let panel = document.querySelector("#yt-sub-panel");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "yt-sub-panel";
            document.body.appendChild(panel);
        }

        const positionClass = viewMode === "sidebar" ? `yt-sub-position-${sidebarPosition}` : "";
        panel.className = `yt-sub-panel-${viewMode} ${positionClass} open`;

        panel.innerHTML = `
      <div class="yt-sub-sidebar">
        <div class="yt-sub-header">
          <div class="yt-sub-title">
            <span class="yt-sub-icon">${icons.youtube || ''}</span>
            Inscrições
          </div>
          <div class="yt-sub-header-actions">
            ${renderDropdown()}
            <button class="yt-sub-btn-icon" data-toggle-export-dropdown title="Exportar">
              ${icons.download || ''}
            </button>
            <button class="yt-sub-btn-icon" id="yt-sub-close" title="Fechar">
              ${icons.close || ''}
            </button>
          </div>
        </div>

        <div class="yt-sub-actions">
          <button class="yt-sub-btn-icon ${state.isAutoScrolling ? 'yt-sub-spinning' : ''}" id="yt-sub-refresh" title="Recarregar">
            ${state.isAutoScrolling ? icons.loader : icons.refresh}
          </button>
          
          ${window.YTSub.dom?.isOnChannelsPage() ? `
            <button class="yt-sub-btn yt-sub-btn-sm yt-sub-btn-load" id="yt-sub-load-all">
              ${state.isAutoScrolling ? icons.loader : icons.download}
              ${state.isAutoScrolling ? `Carregando ${state.autoScrollProgress.current}/${state.autoScrollProgress.total}` : 'Carregar Todos'}
            </button>
          ` : ''}
          
          <button class="yt-sub-btn yt-sub-btn-pill" id="yt-sub-open-folders">
            ${icons.folder || ''} Pastas <span class="yt-sub-badge-inline">${folders.length}</span>
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-select-all">
            ${selectedIds.size === channels.length && channels.length > 0 ? 'Desmarcar' : 'Selecionar'} Tudo
          </button>
          
          <button class="yt-sub-count" id="yt-sub-selection-trigger">
            ${selectedIds.size}/${channels.length}
          </button>
        </div>

        <div class="yt-sub-search-wrap">
          <input type="text" class="yt-sub-search" id="yt-sub-search" placeholder="Pesquisar canais..." />
        </div>

        <div class="yt-sub-content">
          ${renderChannelsList()}
        </div>

        <div class="yt-sub-footer">
          <button class="yt-sub-btn yt-sub-btn-folder" id="yt-sub-new-folder" ${selectedIds.size === 0 ? 'disabled' : ''}>
            ${icons.plus || ''} Nova Pasta
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-unsubscribe" ${selectedIds.size === 0 || state.isProcessing ? 'disabled' : ''}>
            ${icons.trash || ''} Cancelar (${selectedIds.size})
          </button>
        </div>
      </div>
    `;

        // Attach events after rendering
        if (window.YTSub.events?.attachEvents) {
            window.YTSub.events.attachEvents();
        }
    }

    function renderDropdown() {
        const { dropdownOpen, showChannels, showFolders, viewMode, sidebarPosition } = state;

        return `
      <div class="yt-sub-dropdown" style="position: relative;">
        <button class="yt-sub-btn-icon" data-toggle-dropdown title="Configurações">
          ${icons.settings || ''}
        </button>
        ${dropdownOpen ? `
          <div class="yt-sub-dropdown-menu">
            <button class="yt-sub-dropdown-item" data-toggle-channels>
              ${showChannels ? icons.eyeOff : icons.eye} ${showChannels ? 'Ocultar' : 'Mostrar'} Canais
            </button>
            <button class="yt-sub-dropdown-item" data-toggle-folders>
              ${showFolders ? icons.eyeOff : icons.eye} ${showFolders ? 'Ocultar' : 'Mostrar'} Pastas
            </button>
            <div class="yt-sub-dropdown-divider"></div>
            <button class="yt-sub-dropdown-item" data-toggle-view>
              ${viewMode === 'sidebar' ? icons.expand : icons.list} Modo ${viewMode === 'sidebar' ? 'Modal' : 'Sidebar'}
            </button>
            ${viewMode === 'sidebar' ? `
              <button class="yt-sub-dropdown-item" data-toggle-position>
               ${sidebarPosition === 'right' ? '◀' : '▶'} Sidebar ${sidebarPosition === 'right' ? 'Esquerda' : 'Direita'}
              </button>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
    }

    function renderChannelsList() {
        const { channels, selectedIds, showChannels } = state;

        if (!showChannels) {
            return `
        <div class="yt-sub-channels-hidden">
          ${icons.eyeOff || ''}
          <span>Canais ocultos</span>
          <button class="yt-sub-btn yt-sub-btn-sm" data-show-channels>Mostrar Canais</button>
        </div>
      `;
        }

        if (channels.length === 0) {
            return `
        <div class="yt-sub-empty">
          Nenhum canal encontrado. Clique em "Carregar Todos" para buscar.
        </div>
      `;
        }

        return `
      <div class="yt-sub-section">
        <div class="yt-sub-section-title">Todos os canais (${channels.length})</div>
        ${channels.map(ch => `
          <div class="yt-sub-item ${selectedIds.has(ch.id) ? 'selected' : ''}" data-id="${ch.id}">
            <div class="yt-sub-checkbox ${selectedIds.has(ch.id) ? 'checked' : ''}">
              ${icons.check || ''}
            </div>
            <img class="yt-sub-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
            <div class="yt-sub-info">
              <span class="yt-sub-name">${escapeHTML(ch.name)}</span>
              ${ch.subscribers ? `<span class="yt-sub-subs">${escapeHTML(ch.subscribers)}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    }

    // Export public API
    window.YTSub.ui = {
        render,
        escapeHTML,
    };
})();
