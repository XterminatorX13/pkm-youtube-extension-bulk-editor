// YouTube Subscription Bulk Editor - DOM Automation (sem OAuth)
;(() => {
  console.log("[v0] YouTube Sub Manager: Iniciando...")

  // State
  let channels = []
  let folders = JSON.parse(localStorage.getItem("yt-folders") || "[]")
  const selectedIds = new Set()
  let panelOpen = false
  let isProcessing = false

  // SVG Icons
  const icons = {
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`,
    folder: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6M3 22v-6h6M21 13a9 9 0 1 1-3-7.7M3 11a9 9 0 0 1 3 7.7"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    stop: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>`,
  }

  // Salvar pastas
  function saveFolders() {
    localStorage.setItem("yt-folders", JSON.stringify(folders))
  }

  // Detectar canais na página de inscrições
  function scrapeChannels() {
    console.log("[v0] Scraping canais...")
    channels = []

    // Seletores para página youtube.com/feed/channels
    const channelRenderers = document.querySelectorAll("ytd-channel-renderer, ytd-grid-channel-renderer")

    console.log("[v0] Encontrou", channelRenderers.length, "channel renderers")

    channelRenderers.forEach((el, i) => {
      const nameEl = el.querySelector("#channel-title, #text, yt-formatted-string#text")
      const imgEl = el.querySelector("#avatar img, yt-img-shadow img")
      const subsEl = el.querySelector("#subscribers, #subscriber-count")
      const subscribeBtn = el.querySelector("ytd-subscribe-button-renderer, #subscribe-button")

      if (nameEl) {
        channels.push({
          id: `ch-${i}`,
          name: nameEl.textContent?.trim() || "Canal",
          avatar: imgEl?.src || "",
          subscribers: subsEl?.textContent?.trim() || "",
          element: el,
          subscribeBtn: subscribeBtn,
        })
      }
    })

    // Fallback: sidebar
    if (channels.length === 0) {
      const sidebarItems = document.querySelectorAll("#sections ytd-guide-entry-renderer")

      sidebarItems.forEach((el, i) => {
        const link = el.querySelector("a")
        const name = el.querySelector("yt-formatted-string")?.textContent?.trim()
        const img = el.querySelector("img")?.src

        if (name && link?.href?.includes("/@")) {
          channels.push({
            id: `sb-${i}`,
            name: name,
            avatar: img || "",
            subscribers: "",
            element: el,
            href: link.href,
          })
        }
      })
    }

    console.log("[v0] Total de canais:", channels.length)
    return channels
  }

  // Cancelar inscrição via DOM automation
  async function unsubscribeChannel(channel) {
    return new Promise(async (resolve) => {
      console.log("[v0] Cancelando inscrição de:", channel.name)

      if (!channel.subscribeBtn) {
        console.log("[v0] Botão de inscrição não encontrado")
        resolve(false)
        return
      }

      // 1. Clicar no botão "Inscrito"
      const subscribedBtn = channel.subscribeBtn.querySelector(
        "button, yt-button-shape button, #subscribe-button button",
      )

      if (subscribedBtn) {
        subscribedBtn.click()
        console.log("[v0] Clicou no botão Inscrito")

        // 2. Aguardar menu aparecer e clicar em "Cancelar inscrição"
        await sleep(500)

        // Procurar o item do menu
        const menuItems = document.querySelectorAll("ytd-menu-service-item-renderer, tp-yt-paper-item")

        for (const item of menuItems) {
          const text = item.textContent?.toLowerCase() || ""
          if (text.includes("cancelar") || text.includes("unsubscribe")) {
            item.click()
            console.log("[v0] Clicou em Cancelar inscrição")

            // 3. Confirmar no dialog
            await sleep(500)
            const confirmBtn = document.querySelector(
              "yt-confirm-dialog-renderer #confirm-button button, " +
                "#confirm-button yt-button-shape button, " +
                'button[aria-label*="Cancelar inscrição"]',
            )

            if (confirmBtn) {
              confirmBtn.click()
              console.log("[v0] Confirmou cancelamento")
              resolve(true)
              return
            }
          }
        }
      }

      resolve(false)
    })
  }

  // Sleep helper
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }

  // Cancelar múltiplas inscrições
  async function bulkUnsubscribe() {
    if (selectedIds.size === 0 || isProcessing) return

    const toUnsubscribe = channels.filter((c) => selectedIds.has(c.id))

    if (
      !confirm(`Tem certeza que deseja cancelar ${toUnsubscribe.length} inscrição(ões)?\n\nIsso não pode ser desfeito!`)
    ) {
      return
    }

    isProcessing = true
    updateUI()

    let success = 0
    let failed = 0

    for (const channel of toUnsubscribe) {
      updateStatus(`Cancelando: ${channel.name} (${success + failed + 1}/${toUnsubscribe.length})`)

      const result = await unsubscribeChannel(channel)

      if (result) {
        success++
        selectedIds.delete(channel.id)
      } else {
        failed++
      }

      await sleep(1500) // Delay para evitar rate limit
    }

    isProcessing = false
    showToast(`Cancelado: ${success} sucesso, ${failed} falhou`)

    // Recarregar lista
    scrapeChannels()
    updateUI()
  }

  // UI: Status
  function updateStatus(text) {
    const statusEl = document.querySelector("#yt-sub-status")
    if (statusEl) statusEl.textContent = text
  }

  // UI: Toast
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

  // Criar/atualizar UI
  function updateUI() {
    let panel = document.querySelector("#yt-sub-panel")

    if (!panelOpen) {
      if (panel) panel.remove()
      return
    }

    if (!panel) {
      panel = document.createElement("div")
      panel.id = "yt-sub-panel"
      document.body.appendChild(panel)
    }

    const filtered = channels

    panel.innerHTML = `
      <div class="yt-sub-panel-inner">
        <div class="yt-sub-header">
          <div class="yt-sub-title">
            <span class="yt-sub-icon">${icons.youtube}</span>
            Gerenciador de Inscrições
          </div>
          <div class="yt-sub-header-actions">
            <button class="yt-sub-btn-icon" id="yt-sub-refresh" title="Recarregar">${icons.refresh}</button>
            <button class="yt-sub-btn-icon" id="yt-sub-close">${icons.close}</button>
          </div>
        </div>

        <div class="yt-sub-toolbar">
          <input type="text" class="yt-sub-search" placeholder="Pesquisar canais..." id="yt-sub-search" />
          
          <button class="yt-sub-btn" id="yt-sub-select-all">
            ${icons.check} ${selectedIds.size === filtered.length && filtered.length > 0 ? "Desmarcar" : "Selecionar"} Tudo
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-folder" id="yt-sub-folder" ${selectedIds.size === 0 ? "disabled" : ""}>
            ${icons.folder} Pasta
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-unsub" ${selectedIds.size === 0 || isProcessing ? "disabled" : ""}>
            ${isProcessing ? icons.stop : icons.trash} ${isProcessing ? "Processando..." : "Cancelar Inscrição"}
          </button>
          
          <span class="yt-sub-count">${selectedIds.size} selecionado(s)</span>
        </div>

        ${isProcessing ? `<div class="yt-sub-status" id="yt-sub-status">Processando...</div>` : ""}

        <div class="yt-sub-notice">
          <strong>Importante:</strong> Vá para <a href="https://www.youtube.com/feed/channels" target="_blank">youtube.com/feed/channels</a> para ver todas suas inscrições e poder cancelá-las.
        </div>

        <div class="yt-sub-list">
          ${
            filtered.length === 0
              ? `
            <div class="yt-sub-empty">
              <div>${icons.grid}</div>
              <p>Nenhum canal encontrado</p>
              <p class="yt-sub-empty-hint">Vá para a página de inscrições e clique em "Recarregar"</p>
              <a href="https://www.youtube.com/feed/channels" class="yt-sub-btn yt-sub-btn-primary">
                Ir para Inscrições
              </a>
            </div>
          `
              : filtered
                  .map(
                    (ch) => `
            <div class="yt-sub-item ${selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
              <div class="yt-sub-checkbox ${selectedIds.has(ch.id) ? "checked" : ""}">
                ${icons.check}
              </div>
              <img class="yt-sub-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="${ch.name}" />
              <div class="yt-sub-info">
                <div class="yt-sub-name">${ch.name}</div>
                <div class="yt-sub-subs">${ch.subscribers || "—"}</div>
              </div>
              ${ch.href ? `<a href="${ch.href}" target="_blank" class="yt-sub-link">Ver canal</a>` : ""}
            </div>
          `,
                  )
                  .join("")
          }
        </div>

        ${
          folders.length > 0
            ? `
          <div class="yt-sub-folders">
            <div class="yt-sub-folders-title">Suas Pastas</div>
            ${folders
              .map(
                (f) => `
              <div class="yt-sub-folder-item">
                <span>${icons.folder}</span>
                <span>${f.name}</span>
                <span class="yt-sub-folder-count">${f.channels?.length || 0} canais</span>
                <button class="yt-sub-btn-icon yt-sub-folder-delete" data-folder="${f.id}">${icons.trash}</button>
              </div>
            `,
              )
              .join("")}
          </div>
        `
            : ""
        }
      </div>
    `

    // Event listeners
    panel.querySelector("#yt-sub-close")?.addEventListener("click", () => {
      panelOpen = false
      updateUI()
    })

    panel.querySelector("#yt-sub-refresh")?.addEventListener("click", () => {
      scrapeChannels()
      updateUI()
      showToast(`${channels.length} canais encontrados`)
    })

    panel.querySelector("#yt-sub-select-all")?.addEventListener("click", () => {
      if (selectedIds.size === filtered.length) {
        selectedIds.clear()
      } else {
        filtered.forEach((c) => selectedIds.add(c.id))
      }
      updateUI()
    })

    panel.querySelector("#yt-sub-unsub")?.addEventListener("click", bulkUnsubscribe)

    panel.querySelector("#yt-sub-folder")?.addEventListener("click", openFolderModal)

    panel.querySelector("#yt-sub-search")?.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase()
      panel.querySelectorAll(".yt-sub-item").forEach((item) => {
        const name = item.querySelector(".yt-sub-name")?.textContent?.toLowerCase() || ""
        item.style.display = name.includes(query) ? "flex" : "none"
      })
    })

    // Item click
    panel.querySelectorAll(".yt-sub-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id
        if (selectedIds.has(id)) {
          selectedIds.delete(id)
        } else {
          selectedIds.add(id)
        }
        updateUI()
      })
    })

    // Delete folder
    panel.querySelectorAll(".yt-sub-folder-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const folderId = btn.dataset.folder
        folders = folders.filter((f) => f.id !== folderId)
        saveFolders()
        updateUI()
      })
    })
  }

  // Modal de pastas
  function openFolderModal() {
    const modal = document.createElement("div")
    modal.className = "yt-sub-modal"
    modal.innerHTML = `
      <div class="yt-sub-modal-content">
        <div class="yt-sub-modal-title">Mover para Pasta</div>
        
        <div class="yt-sub-modal-folders">
          ${folders
            .map(
              (f) => `
            <div class="yt-sub-modal-folder" data-id="${f.id}">
              ${icons.folder} ${f.name}
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="yt-sub-modal-new">
          <input type="text" class="yt-sub-input" placeholder="Nome da nova pasta" id="new-folder-name" />
          <button class="yt-sub-btn yt-sub-btn-primary" id="create-folder">Criar</button>
        </div>
        
        <div class="yt-sub-modal-actions">
          <button class="yt-sub-btn" id="close-modal">Cancelar</button>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    modal.querySelector("#close-modal").addEventListener("click", () => modal.remove())

    modal.querySelector("#create-folder").addEventListener("click", () => {
      const name = modal.querySelector("#new-folder-name").value.trim()
      if (name) {
        const newFolder = {
          id: `folder-${Date.now()}`,
          name: name,
          channels: Array.from(selectedIds),
        }
        folders.push(newFolder)
        saveFolders()
        selectedIds.clear()
        modal.remove()
        updateUI()
        showToast(`Pasta "${name}" criada com ${newFolder.channels.length} canal(is)`)
      }
    })

    modal.querySelectorAll(".yt-sub-modal-folder").forEach((el) => {
      el.addEventListener("click", () => {
        const folderId = el.dataset.id
        const folder = folders.find((f) => f.id === folderId)
        if (folder) {
          selectedIds.forEach((id) => {
            if (!folder.channels) folder.channels = []
            if (!folder.channels.includes(id)) {
              folder.channels.push(id)
            }
          })
          saveFolders()
          selectedIds.clear()
          modal.remove()
          updateUI()
          showToast(`Movido para "${folder.name}"`)
        }
      })
    })
  }

  // Criar FAB
  function createFAB() {
    if (document.querySelector("#yt-sub-fab")) return

    const fab = document.createElement("button")
    fab.id = "yt-sub-fab"
    fab.innerHTML = icons.grid
    fab.title = "Gerenciar Inscrições"

    fab.addEventListener("click", () => {
      panelOpen = !panelOpen
      if (panelOpen) {
        scrapeChannels()
      }
      updateUI()
    })

    document.body.appendChild(fab)
    console.log("[v0] FAB criado")
  }

  // Injetar estilos
  function injectStyles() {
    if (document.querySelector("#yt-sub-styles")) return

    const style = document.createElement("style")
    style.id = "yt-sub-styles"
    style.textContent = `
      #yt-sub-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        background: #ff0000;
        border: none;
        border-radius: 50%;
        color: white;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(255,0,0,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #yt-sub-fab:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(255,0,0,0.5);
      }
      #yt-sub-fab svg {
        width: 24px;
        height: 24px;
      }

      #yt-sub-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.85);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Roboto', Arial, sans-serif;
      }

      .yt-sub-panel-inner {
        background: #212121;
        border-radius: 12px;
        width: 95%;
        max-width: 800px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .yt-sub-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: #181818;
        border-bottom: 1px solid #383838;
      }

      .yt-sub-title {
        display: flex;
        align-items: center;
        gap: 12px;
        color: white;
        font-size: 18px;
        font-weight: 500;
      }

      .yt-sub-icon {
        color: #ff0000;
        display: flex;
      }
      .yt-sub-icon svg {
        width: 24px;
        height: 24px;
      }

      .yt-sub-header-actions {
        display: flex;
        gap: 8px;
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
      .yt-sub-btn-icon:hover {
        background: #383838;
        color: white;
      }
      .yt-sub-btn-icon svg {
        width: 20px;
        height: 20px;
      }

      .yt-sub-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        background: #212121;
        border-bottom: 1px solid #383838;
        flex-wrap: wrap;
      }

      .yt-sub-search {
        flex: 1;
        min-width: 150px;
        background: #121212;
        border: 1px solid #383838;
        border-radius: 20px;
        padding: 8px 16px;
        color: white;
        font-size: 14px;
        outline: none;
      }
      .yt-sub-search:focus {
        border-color: #3ea6ff;
      }

      .yt-sub-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 18px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        background: #383838;
        color: white;
        transition: background 0.2s;
      }
      .yt-sub-btn:hover:not(:disabled) {
        background: #4a4a4a;
      }
      .yt-sub-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .yt-sub-btn svg {
        width: 16px;
        height: 16px;
      }

      .yt-sub-btn-primary {
        background: #3ea6ff;
        color: #0d0d0d;
      }
      .yt-sub-btn-primary:hover:not(:disabled) {
        background: #65b8ff;
      }

      .yt-sub-btn-danger {
        background: #cc0000;
      }
      .yt-sub-btn-danger:hover:not(:disabled) {
        background: #ff0000;
      }

      .yt-sub-btn-folder {
        background: #f59e0b;
        color: #0d0d0d;
      }

      .yt-sub-count {
        color: #aaa;
        font-size: 13px;
        margin-left: auto;
      }

      .yt-sub-status {
        padding: 10px 20px;
        background: #1a365d;
        color: #63b3ed;
        font-size: 13px;
        text-align: center;
      }

      .yt-sub-notice {
        padding: 12px 20px;
        background: #2d2d0d;
        color: #d4d400;
        font-size: 12px;
        border-bottom: 1px solid #383838;
      }
      .yt-sub-notice a {
        color: #3ea6ff;
      }

      .yt-sub-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px 20px;
      }

      .yt-sub-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: #717171;
        text-align: center;
      }
      .yt-sub-empty svg {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }
      .yt-sub-empty p {
        margin: 0 0 8px 0;
      }
      .yt-sub-empty-hint {
        font-size: 12px;
        margin-bottom: 16px !important;
      }

      .yt-sub-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
        margin-bottom: 4px;
      }
      .yt-sub-item:hover {
        background: #383838;
      }
      .yt-sub-item.selected {
        background: rgba(62,166,255,0.15);
      }

      .yt-sub-checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid #717171;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
      }
      .yt-sub-checkbox svg {
        width: 14px;
        height: 14px;
        opacity: 0;
        color: #0d0d0d;
      }
      .yt-sub-checkbox.checked {
        background: #3ea6ff;
        border-color: #3ea6ff;
      }
      .yt-sub-checkbox.checked svg {
        opacity: 1;
      }

      .yt-sub-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .yt-sub-info {
        flex: 1;
        min-width: 0;
      }

      .yt-sub-name {
        color: white;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .yt-sub-subs {
        color: #aaa;
        font-size: 12px;
        margin-top: 2px;
      }

      .yt-sub-link {
        color: #3ea6ff;
        font-size: 12px;
        text-decoration: none;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .yt-sub-link:hover {
        background: #383838;
      }

      .yt-sub-folders {
        padding: 12px 20px;
        border-top: 1px solid #383838;
        background: #181818;
      }

      .yt-sub-folders-title {
        color: #aaa;
        font-size: 12px;
        margin-bottom: 8px;
        text-transform: uppercase;
      }

      .yt-sub-folder-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #212121;
        border-radius: 6px;
        margin-bottom: 4px;
        color: white;
        font-size: 13px;
      }
      .yt-sub-folder-item svg {
        width: 16px;
        height: 16px;
        color: #f59e0b;
      }
      .yt-sub-folder-count {
        color: #717171;
        font-size: 11px;
        margin-left: auto;
      }
      .yt-sub-folder-delete {
        padding: 4px;
      }
      .yt-sub-folder-delete svg {
        width: 14px;
        height: 14px;
        color: #aaa;
      }

      /* Modal */
      .yt-sub-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .yt-sub-modal-content {
        background: #212121;
        border-radius: 12px;
        padding: 20px;
        width: 90%;
        max-width: 360px;
      }

      .yt-sub-modal-title {
        color: white;
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 16px;
      }

      .yt-sub-modal-folders {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 16px;
      }

      .yt-sub-modal-folder {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        border-radius: 6px;
        cursor: pointer;
        color: white;
        font-size: 14px;
        transition: background 0.2s;
      }
      .yt-sub-modal-folder:hover {
        background: #383838;
      }
      .yt-sub-modal-folder svg {
        width: 18px;
        height: 18px;
        color: #f59e0b;
      }

      .yt-sub-modal-new {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .yt-sub-input {
        flex: 1;
        background: #121212;
        border: 1px solid #383838;
        border-radius: 6px;
        padding: 10px 12px;
        color: white;
        font-size: 14px;
        outline: none;
      }
      .yt-sub-input:focus {
        border-color: #3ea6ff;
      }

      .yt-sub-modal-actions {
        display: flex;
        justify-content: flex-end;
      }

      /* Toast */
      .yt-sub-toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #323232;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10002;
        opacity: 0;
        transition: all 0.3s;
        pointer-events: none;
      }
      .yt-sub-toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    `
    document.head.appendChild(style)
  }

  // Inicializar
  function init() {
    console.log("[v0] Inicializando extensão...")
    injectStyles()

    // Criar FAB após página carregar
    if (document.readyState === "complete") {
      createFAB()
    } else {
      window.addEventListener("load", createFAB)
    }

    // Também criar após 2 segundos (fallback)
    setTimeout(createFAB, 2000)
  }

  init()
})()
