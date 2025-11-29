// YouTube Subscription Bulk Editor - DOM Automation (sem OAuth)
; (() => {
  debugLog("YouTube Sub Manager: Iniciando...")

  // State
  let channels = []
  let folders = safeGetLocalStorage("yt-folders", [])
  const selectedIds = new Set()
  let panelOpen = false
  let viewMode = safeGetLocalStorage("yt-view-mode", "sidebar")
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
  }

  // Security: Safe localStorage wrappers with validation
  const DEBUG = false // Set to false for production builds

  function debugLog(...args) {
    if (DEBUG) console.log("[YT-Bulk]", ...args)
  }

  function safeGetLocalStorage(key, defaultValue) {
    try {
      const value = localStorage.getItem(key)
      if (value === null) return defaultValue
      const parsed = JSON.parse(value)
      // Additional validation for arrays
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

  function saveFolders() {
    safeSetLocalStorage("yt-folders", folders)
  }

  function saveVisibility() {
    safeSetLocalStorage("yt-show-channels", showChannels)
    safeSetLocalStorage("yt-show-folders", showFolders)
  }

  function isOnChannelsPage() {
    return window.location.href.includes("/feed/channels")
  }

  // Security: URL validation to prevent open redirect
  function isValidYouTubeURL(url) {
    if (!url) return false
    try {
      const parsed = new URL(url)
      return parsed.hostname.endsWith('youtube.com') ||
        parsed.hostname.endsWith('youtu.be') ||
        parsed.hostname === 'youtube.com' ||
        parsed.hostname === 'youtu.be'
    } catch {
      return false
    }
  }

  function scrapeChannels() {
    debugLog("Scraping canais...")
    const existingNames = new Set(channels.map((c) => c.name))

    const channelRenderers = document.querySelectorAll("ytd-channel-renderer, ytd-grid-channel-renderer")

    channelRenderers.forEach((el, i) => {
      const nameEl = el.querySelector("#channel-title, #text, yt-formatted-string#text")
      const imgEl = el.querySelector("#avatar img, yt-img-shadow img")
      const subsEl = el.querySelector("#subscribers, #subscriber-count")
      const subscribeBtn = el.querySelector("ytd-subscribe-button-renderer, #subscribe-button")

      if (nameEl) {
        const name = nameEl.innerText?.trim() || "Canal"
        if (!existingNames.has(name)) {
          existingNames.add(name)
          channels.push({
            id: `ch-${Date.now()}-${i}`,
            name: name,
            avatar: imgEl?.src || "",
            subscribers: subsEl?.innerText?.trim() || "",
            element: el,
            subscribeBtn: subscribeBtn,
          })
        }
      }
    })

    // Fallback para sidebar se não encontrar nada
    if (channels.length === 0) {
      const sidebarItems = document.querySelectorAll("#sections ytd-guide-entry-renderer")
      sidebarItems.forEach((el, i) => {
        const link = el.querySelector("a")
        const name = el.querySelector("yt-formatted-string")?.innerText?.trim()
        const img = el.querySelector("img")?.src
        const href = link?.href

        if (name && href && isValidYouTubeURL(href) && href.includes("/@") && !existingNames.has(name)) {
          existingNames.add(name)
          channels.push({
            id: `sb-${i}`,
            name: name,
            avatar: img || "",
            subscribers: "",
            element: el,
            href: href,
          })
        }
      })
    }

    debugLog("Total de canais:", channels.length)
    return channels
  }

  async function autoScrollAndLoad(maxScrolls = 20) {
    if (!isOnChannelsPage()) {
      showToast("Vá para youtube.com/feed/channels primeiro!")
      return
    }

    isAutoScrolling = true
    autoScrollProgress = { current: 0, total: maxScrolls, found: channels.length }
    updateUI()

    let previousCount = channels.length
    let noNewChannels = 0

    // Encontrar o container de scroll do YouTube
    const scrollContainer =
      document.querySelector("ytd-page-manager") || document.querySelector("#page-manager") || document.documentElement

    for (let i = 0; i < maxScrolls; i++) {
      autoScrollProgress.current = i + 1
      autoScrollProgress.found = channels.length
      updateUI()
      updateStatus(`Carregando... ${channels.length} canais (scroll ${i + 1}/${maxScrolls})`)

      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      })

      // Também tenta scrollar o conteúdo principal do YouTube
      const ytContent = document.querySelector('ytd-browse[page-subtype="channels"]')
      if (ytContent) {
        ytContent.scrollIntoView({ behavior: "smooth", block: "end" })
      }

      // Aguarda conteúdo carregar
      await sleep(1800)

      // Scrapa os novos canais
      scrapeChannels()

      // Verifica se encontrou novos
      if (channels.length === previousCount) {
        noNewChannels++
        debugLog(`Nenhum canal novo na tentativa ${noNewChannels}`)
        if (noNewChannels >= 3) {
          debugLog("Finalizando - sem novos canais")
          break
        }
      } else {
        noNewChannels = 0
        debugLog(`Encontrados ${channels.length - previousCount} novos canais`)
      }

      previousCount = channels.length
    }

    // Volta ao topo suavemente
    window.scrollTo({ top: 0, behavior: "smooth" })

    isAutoScrolling = false
    autoScrollProgress.found = channels.length
    showToast(`Carregados ${channels.length} canais!`)
    updateUI()
  }

  async function unsubscribeChannel(channel) {
    return new Promise(async (resolve) => {
      debugLog("Iniciando cancelamento para:", channel.name)

      // 1. Scroll suave para o canal (centralizado)
      if (channel.element) {
        const rect = channel.element.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetY = rect.top + scrollTop - window.innerHeight / 2

        window.scrollTo({
          top: targetY,
          behavior: "smooth",
        })
        await sleep(150)
      }

      // 2. Encontrar botão de inscrição
      const subscribeContainer = channel.element?.querySelector(
        "#subscribe-button, ytd-subscribe-button-renderer, [class*='subscribe']"
      )

      if (!subscribeContainer) {
        debugLog("Container não encontrado")
        resolve(false)
        return
      }

      const subscribedBtn =
        subscribeContainer.querySelector("button, yt-button-shape button, yt-smartimation button, [role='button']") ||
        subscribeContainer

      if (!subscribedBtn) {
        debugLog("Botão não encontrado")
        resolve(false)
        return
      }

      // 3. Clicar no botão para abrir menu/dialog
      subscribedBtn.click()
      await sleep(150)

      // 4. Lógica de Retry para encontrar o botão de confirmação
      // O GitHub repo usa um loop de retry robusto aqui
      await new Promise((resolveConfirm) => {
        let attempts = 0
        const maxAttempts = 20 // 2 segundos max

        const waitForConfirmationButton = () => {
          // Seletores simplificados e diretos (do GitHub repo + extras)
          const selectors = [
            "yt-confirm-dialog-renderer #confirm-button button",
            "button[aria-label*='Cancelar']",
            "button[aria-label*='Unsubscribe']",
            "#confirm-button button",
            "yt-button-renderer#confirm-button button",
            "[aria-label='Cancelar inscrição']"
          ]

          let confirmBtn = null
          for (const selector of selectors) {
            confirmBtn = document.querySelector(selector)
            if (confirmBtn) break
          }

          if (confirmBtn) {
            confirmBtn.click()
            debugLog("Confirmado com sucesso!")
            resolveConfirm(true)
          } else {
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(waitForConfirmationButton, 100)
            } else {
              debugLog("Timeout esperando confirmação")
              // Tenta fechar menu se falhou
              document.body.click()
              resolveConfirm(false)
            }
          }
        }

        waitForConfirmationButton()
      })

      // 5. Delay Randomizado (CRÍTICO para evitar rate limit)
      // 250ms a 500ms de delay extra
      const randomDelay = 250 + Math.random() * 250
      await sleep(randomDelay)

      resolve(true)
    })
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
  }

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

    // Criar Overlay de Progresso
    const overlay = document.createElement("div")
    overlay.className = "yt-sub-progress-overlay"
    overlay.innerHTML = `
      <div class="yt-sub-progress-box">
        <h3>Cancelando Inscrições...</h3>
        <div class="yt-sub-progress-text">Iniciando...</div>
        <div class="yt-sub-progress-bar-bg">
          <div class="yt-sub-progress-bar-fill" style="width: 0%"></div>
        </div>
        <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-stop-btn">PARAR</button>
      </div>
    `
    document.body.appendChild(overlay)

    let shouldStop = false
    document.getElementById("yt-sub-stop-btn").addEventListener("click", () => {
      shouldStop = true
      overlay.querySelector(".yt-sub-progress-text").textContent = "Parando..."
    })

    let success = 0
    let failed = 0
    let processed = 0
    let consecutiveFailures = 0
    const RATE_LIMIT_THRESHOLD = 3

    for (const channel of toUnsubscribe) {
      if (shouldStop) break

      processed++
      const percent = Math.round((processed / toUnsubscribe.length) * 100)

      // Atualiza Overlay
      overlay.querySelector(".yt-sub-progress-text").innerHTML = `
        <strong>${processed}/${toUnsubscribe.length}</strong><br>
        Processando: ${channel.name}
      `
      overlay.querySelector(".yt-sub-progress-bar-fill").style.width = `${percent}%`

      const result = await unsubscribeChannel(channel)

      if (result) {
        success++
        consecutiveFailures = 0  // Reset on success
        selectedIds.delete(channel.id)
      } else {
        failed++
        consecutiveFailures++

        // Rate limit detection
        if (consecutiveFailures >= RATE_LIMIT_THRESHOLD) {
          overlay.querySelector(".yt-sub-progress-text").innerHTML = `
            <strong style="color: #ff4e45;">⚠️ Possível Rate Limit Detectado</strong><br>
            O YouTube pode estar bloqueando suas ações.<br>
            <span style="font-size: 12px;">Aguarde 5-10 minutos antes de tentar novamente.</span><br><br>
            <strong>Estatísticas:</strong><br>
            ✅ Sucesso: ${success}<br>
            ❌ Falhas: ${failed}
          `
          shouldStop = true
          setTimeout(() => overlay.remove(), 8000)  // Auto-close after 8 seconds
          break
        }
      }
    }

    // Remover Overlay
    if (!shouldStop || consecutiveFailures < RATE_LIMIT_THRESHOLD) {
      overlay.remove()
    }

    isProcessing = false

    if (consecutiveFailures >= RATE_LIMIT_THRESHOLD) {
      showToast("⚠️ Rate limit detectado - processo interrompido")
    } else {
      showToast(shouldStop ? "Processo interrompido!" : `Concluído: ${success} cancelados, ${failed} falhas`)
    }

    // Limpa e re-scrapa
    channels = []
    scrapeChannels()
    updateUI()
  }

  function updateStatus(text) {
    const statusEl = document.querySelector("#yt-sub-status")
    if (statusEl) statusEl.textContent = text
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

  function exportChannels(format = 'csv') {
    if (channels.length === 0) {
      showToast("Nenhum canal para exportar!")
      return
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    let content, mimeType, filename

    switch (format) {
      case 'csv':
        content = [
          ["Nome do Canal", "Inscritos", "Link"],
          ...channels.map(c => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.subscribers}"`,
            c.href || ""
          ])
        ].map(e => e.join(",")).join("\n")
        mimeType = "text/csv;charset=utf-8;"
        filename = `youtube_subs_${timestamp}.csv`
        break

      case 'json':
        const jsonData = {
          exportDate: new Date().toISOString(),
          totalChannels: channels.length,
          folders: folders.map(f => ({
            name: f.name,
            channels: f.channels.map(chId => {
              const ch = channels.find(c => c.id === chId)
              return ch ? { name: ch.name, subscribers: ch.subscribers, href: ch.href } : null
            }).filter(Boolean)
          })),
          channels: channels.map(c => ({
            name: c.name,
            subscribers: c.subscribers,
            href: c.href
          }))
        }
        content = JSON.stringify(jsonData, null, 2)
        mimeType = "application/json;charset=utf-8;"
        filename = `youtube_subs_${timestamp}.json`
        break

      case 'markdown':
        // Markdown format for Obsidian/Notion
        let md = `# YouTube Subscriptions\n\n`
        md += `**Exported:** ${new Date().toLocaleString()}\n`
        md += `**Total Channels:** ${channels.length}\n\n`

        // Folders
        if (folders.length > 0) {
          md += `## 📁 Folders\n\n`
          folders.forEach(f => {
            md += `### ${f.name}\n\n`
            f.channels.forEach(chId => {
              const ch = channels.find(c => c.id === chId)
              if (ch) {
                md += `- [${ch.name}](${ch.href || '#'})${ch.subscribers ? ` - ${ch.subscribers}` : ''}\n`
              }
            })
            md += `\n`
          })
        }

        // All channels
        md += `## 📺 All Channels\n\n`
        md += `| Channel | Subscribers | Link |\n`
        md += `|---------|-------------|------|\n`
        channels.forEach(c => {
          md += `| ${c.name.replace(/\|/g, '\\|')} | ${c.subscribers} | [Link](${c.href || '#'}) |\n`
        })

        content = md
        mimeType = "text/markdown;charset=utf-8;"
        filename = `youtube_subs_${timestamp}.md`
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    showToast(`✅ Exportado como ${format.toUpperCase()}!`)
  }

  // Legacy function for backward compatibility
  function exportCSV() {
    exportChannels('csv')
  }

  function backupFolders() {
    if (folders.length === 0) {
      showToast("Nenhuma pasta para fazer backup!")
      return
    }

    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      folders: folders,
      totalFolders: folders.length
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8;"
    })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `youtube_folders_backup_${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    showToast(`✅ Backup de ${folders.length} pastas criado!`)
  }

  function restoreFolders() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)

          // Validation
          if (!data.folders || !Array.isArray(data.folders)) {
            throw new Error("Formato inválido - faltando array 'folders'")
          }

          if (folders.length === 0) {
            // No existing folders, just import
            folders = data.folders
            saveFolders()
            updateUI()
            showToast(`✅ ${data.folders.length} pastas restauradas!`)
            return
          }

          // Ask user: merge or replace?
          const shouldMerge = confirm(
            `Encontradas ${data.folders.length} pastas no backup.\n\n` +
            `Você tem ${folders.length} pastas atualmente.\n\n` +
            `OK = ADICIONAR às pastas existentes (merge)\n` +
            `CANCELAR = SUBSTITUIR todas as pastas`
          )

          if (shouldMerge) {
            // Merge: add only new folders (by ID)
            let added = 0
            data.folders.forEach(f => {
              if (!folders.find(existing => existing.id === f.id)) {
                folders.push(f)
                added++
              }
            })
            showToast(`✅ ${added} pastas adicionadas (${folders.length} total)`)
          } else {
            // Replace all
            folders = data.folders
            showToast(`✅ ${data.folders.length} pastas substituídas!`)
          }

          saveFolders()
          updateUI()
        } catch (err) {
          console.error("[Security] Restore error:", err)
          showToast(`❌ Erro ao restaurar: ${err.message}`)
        }
      }

      reader.readAsText(file)
    }

    input.click()
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

  function debouncedUpdateUI() {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      updateUIInternal()
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
            <button class="yt-sub-btn-icon" data-close-folder-preview title="Fechar">${icons.close}</button>
          </div>
          <div class="yt-sub-folder-preview-list">
            ${folderChannels.length === 0
        ? `<div class="yt-sub-empty-mini">Pasta vazia</div>`
        : folderChannels
          .map(
            (ch) => `
                <div class="yt-sub-mini-item ${selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                  <div class="yt-sub-checkbox-mini ${selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
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
              ${icons.trash} Excluir Pasta
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
              ${icons.folder} Minhas Pastas
            </div>
            <button class="yt-sub-btn-icon" data-close-folders-modal title="Fechar">${icons.close}</button>
          </div>
          <div class="yt-sub-folders-modal-list">
            ${folders.length === 0
        ? `<div class="yt-sub-empty-mini">Nenhuma pasta criada</div>`
        : folders
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
                ? `<span class="yt-sub-folder-empty-text">Vazia</span>`
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
    const selectedChannels = channels.filter(c => selectedIds.has(c.id))

    return `
      <div class="yt-sub-folders-modal">
        <div class="yt-sub-folders-modal-content">
          <div class="yt-sub-folders-modal-header">
            <div class="yt-sub-folders-modal-title">
              ${icons.check} Selecionados (${selectedChannels.length})
            </div>
            <button class="yt-sub-btn-icon" data-close-selection-modal title="Fechar">${icons.close}</button>
          </div>
          <div class="yt-sub-folders-modal-list">
            ${selectedChannels.length === 0
        ? `<div class="yt-sub-empty-mini">Nenhum canal selecionado</div>`
        : selectedChannels
          .map(
            (ch) => `
                <div class="yt-sub-mini-item">
                  <img class="yt-sub-avatar-mini" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                  <span class="yt-sub-name-mini">${escapeHTML(ch.name)}</span>
                  <button class="yt-sub-btn-icon yt-sub-remove-selection" data-remove-id="${ch.id}" title="Remover da seleção">
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
              Limpar Seleção
            </button>
          </div>
        </div>
      </div>
    `
  }

  function renderDropdown() {
    return `
      <div class="yt-sub-dropdown ${dropdownOpen ? "open" : ""}">
        <button class="yt-sub-btn-icon yt-sub-dropdown-trigger" data-toggle-dropdown title="Opções de visualização">
          ${icons.settings}
        </button>
        <div class="yt-sub-dropdown-menu">
          <div class="yt-sub-dropdown-item" data-toggle-channels>
            <span>${showChannels ? icons.eye : icons.eyeOff}</span>
            <span>${showChannels ? "Ocultar" : "Mostrar"} Canais</span>
          </div>
          <div class="yt-sub-dropdown-item" data-toggle-folders>
            <span>${showFolders ? icons.eye : icons.eyeOff}</span>
            <span>${showFolders ? "Ocultar" : "Mostrar"} Pastas</span>
          </div>
          <div class="yt-sub-dropdown-divider"></div>
          <div class="yt-sub-dropdown-item" data-toggle-view>
            <span>${viewMode === "sidebar" ? icons.grid : icons.list}</span>
            <span>Modo ${viewMode === "sidebar" ? "Modal" : "Sidebar"}</span>
          </div>
        </div>
      </div>
    `
  }

  function updateUIInternal() {
    let panel = document.querySelector("#yt-sub-panel")

    if (!panelOpen) {
      if (panel) panel.classList.remove("open")
      folderPreviewOpen = null
      foldersModalOpen = false
      dropdownOpen = false
      return
    }

    const contentDiv = document.querySelector(".yt-sub-content")
    if (contentDiv) {
      scrollPosition = contentDiv.scrollTop
    }

    if (!panel) {
      panel = document.createElement("div")
      panel.id = "yt-sub-panel"
      document.body.appendChild(panel)
    }

    panel.className = `yt-sub-panel-${viewMode}`
    panel.classList.add("open")

    const filtered = channels

    const dynamicClass = !showChannels && showFolders ? "compact" : ""

    const notOnChannelsPage = !isOnChannelsPage()

    const counterText = isAutoScrolling
      ? `${selectedIds.size}/${autoScrollProgress.found}...`
      : `${selectedIds.size}/${channels.length}`

    panel.innerHTML = `
      <div class="yt-sub-sidebar ${dynamicClass}">
        <div class="yt-sub-header">
          <div class="yt-sub-title">
            <span class="yt-sub-icon">${icons.youtube}</span>
            Inscrições
          </div>
          <div class="yt-sub-header-actions">
            ${renderDropdown()}
            <button class="yt-sub-btn-icon" id="yt-sub-close" title="Fechar">${icons.close}</button>
          </div>
        </div>

        <!-- Aviso quando não está na página correta -->
        ${notOnChannelsPage
        ? `
        <div class="yt-sub-warning">
          <span class="yt-sub-warning-icon">!</span>
          <div class="yt-sub-warning-text">
            <p>Para carregar todos os canais, vá para a página de inscrições:</p>
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
          <button class="yt-sub-btn-icon ${isAutoScrolling ? "yt-sub-spinning" : ""}" id="yt-sub-refresh" title="Recarregar canais" ${isAutoScrolling ? "disabled" : ""}>
            ${isAutoScrolling ? icons.loader : icons.refresh}
          </button>
          
          <!-- Botão para carregar todos os canais via scroll -->
          ${isOnChannelsPage()
        ? `
          <button class="yt-sub-btn yt-sub-btn-sm yt-sub-btn-load ${isAutoScrolling ? "loading" : ""}" id="yt-sub-load-all" ${isAutoScrolling ? "disabled" : ""}>
            ${isAutoScrolling ? icons.loader : icons.download} 
            ${isAutoScrolling ? `Carregando ${autoScrollProgress.current}/${autoScrollProgress.total}` : "Carregar Todos"}
          </button>
          `
        : ""
      }
          
          <button class="yt-sub-btn yt-sub-btn-pill yt-sub-btn-folders" id="yt-sub-open-folders">
            ${icons.folder} Pastas <span class="yt-sub-badge-inline">${folders.length}</span>
          </button>
          
          <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-select-all">
            ${selectedIds.size === filtered.length && filtered.length > 0 ? "Desmarcar" : "Selecionar"} Tudo
          </button>
          <button class="yt-sub-count" id="yt-sub-selection-trigger" title="Ver selecionados">
            ${counterText}
          </button>
        </div>

        <div class="yt-sub-search-wrap">
          <input type="text" class="yt-sub-search" placeholder="Pesquisar canais..." id="yt-sub-search" />
        </div>

        ${isProcessing || isAutoScrolling ? `<div class="yt-sub-status" id="yt-sub-status">${isAutoScrolling ? `Carregando canais... ${channels.length} encontrados` : "Processando..."}</div>` : ""}

        <div class="yt-sub-content">
          <!-- Pastas (sem sticky para evitar bug de sobreposição) -->
          ${showFolders && folders.length > 0
        ? `
            <div class="yt-sub-section yt-sub-folders-section">
              <div class="yt-sub-section-title">Pastas</div>
              ${folders
          .map((f) => {
            const isExpanded = expandedFolders.has(f.id)
            const folderChannels = (f.channels || []).map((id) => getChannelById(id)).filter(Boolean)
            return `
                  <div class="yt-sub-folder ${isExpanded ? "expanded" : ""}" data-folder-id="${f.id}">
                    <div class="yt-sub-folder-header" data-toggle="${f.id}">
                      <span class="yt-sub-folder-chevron">${isExpanded ? icons.chevronDown : icons.chevronRight}</span>
                      <span class="yt-sub-folder-icon">${icons.folder}</span>
                      <span class="yt-sub-folder-name">${escapeHTML(f.name)}</span>
                      <span class="yt-sub-folder-badge">${folderChannels.length}</span>
                      <button class="yt-sub-btn-icon yt-sub-folder-delete" data-delete="${f.id}" title="Excluir pasta">${icons.trash}</button>
                    </div>
                    ${isExpanded
                ? `
                      <div class="yt-sub-folder-content">
                        ${folderChannels.length === 0
                  ? `<div class="yt-sub-folder-empty">Pasta vazia</div>`
                  : folderChannels
                    .map(
                      (ch) => `
                            <div class="yt-sub-item yt-sub-item-sm ${selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                              <div class="yt-sub-checkbox ${selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
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
          ${showChannels
        ? `
            <div class="yt-sub-section">
              <div class="yt-sub-section-title">Todos os canais (${filtered.length})</div>
              ${filtered.length === 0
          ? `<div class="yt-sub-empty">Nenhum canal encontrado. Clique em "Carregar Todos" para buscar.</div>`
          : filtered
            .map(
              (ch) => `
                  <div class="yt-sub-item ${selectedIds.has(ch.id) ? "selected" : ""}" data-id="${ch.id}">
                    <div class="yt-sub-checkbox ${selectedIds.has(ch.id) ? "checked" : ""}">${icons.check}</div>
                    <img class="yt-sub-avatar" src="${ch.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=random`}" alt="" />
                    <div class="yt-sub-info">
                      <span class="yt-sub-name">${escapeHTML(ch.name)}</span>
                      ${ch.subscribers ? `<span class="yt-sub-subs">${escapeHTML(ch.subscribers)}</span>` : ""}
                    </div>
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
              <span>Canais ocultos</span>
              <button class="yt-sub-btn yt-sub-btn-sm" data-show-channels>Mostrar Canais</button>
            </div>
          `
      }
        </div>

        <div class="yt-sub-footer">
          <button class="yt-sub-btn yt-sub-btn-folder" id="yt-sub-new-folder" ${selectedIds.size === 0 ? "disabled" : ""}>
            ${icons.plus} Nova Pasta
          </button>
          
          <div style="display: flex; gap: 4px;">
            <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-export-csv" title="Exportar como CSV">
               ${icons.download} CSV
            </button>
            <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-export-json" title="Exportar como JSON">
               ${icons.download} JSON
            </button>
            <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-export-md" title="Exportar como Markdown (Obsidian/Notion)">
               ${icons.download} MD
            </button>
          </div>
          
          <div style="display: flex; gap: 4px;">
            <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-backup-folders" title="Backup de pastas">
               💾 Backup
            </button>
            <button class="yt-sub-btn yt-sub-btn-sm" id="yt-sub-restore-folders" title="Restaurar pastas">
               📥 Restaurar
            </button>
          </div>
          
          <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-unsubscribe" ${selectedIds.size === 0 || isProcessing ? "disabled" : ""}>
            ${icons.trash} Cancelar Inscrição (${selectedIds.size})
          </button>
        </div>
      </div>

      ${foldersModalOpen ? renderFoldersModal() : ""}
      ${folderPreviewOpen ? renderFolderPreviewModal(folders.find((f) => f.id === folderPreviewOpen)) : ""}
      ${selectionModalOpen ? renderSelectionModal() : ""}
    `

    // Restaurar scroll
    const newContentDiv = document.querySelector(".yt-sub-content")
    if (newContentDiv && scrollPosition > 0) {
      setTimeout(() => {
        newContentDiv.scrollTop = scrollPosition
      }, 10)
    }

    // Event Listeners
    attachEventListeners()
  }

  function attachEventListeners() {
    // Close button
    document.querySelector("#yt-sub-close")?.addEventListener("click", () => {
      panelOpen = false
      updateUI()
    })

    // Refresh
    document.querySelector("#yt-sub-refresh")?.addEventListener("click", () => {
      if (!isAutoScrolling) {
        channels = []
        scrapeChannels()
        updateUI()
        showToast(`${channels.length} canais carregados`)
      }
    })

    // Load all (auto-scroll)
    document.querySelector("#yt-sub-load-all")?.addEventListener("click", () => {
      if (!isAutoScrolling) {
        autoScrollAndLoad(20)
      }
    })

    // Open folders modal
    document.querySelector("#yt-sub-open-folders")?.addEventListener("click", () => {
      foldersModalOpen = true
      updateUI()
    })

    // Close folders modal
    document.querySelector("[data-close-folders-modal]")?.addEventListener("click", () => {
      foldersModalOpen = false
      updateUI()
    })

    // Open folder preview from modal
    document.querySelectorAll("[data-open-folder-preview]").forEach((el) => {
      el.addEventListener("click", () => {
        folderPreviewOpen = el.getAttribute("data-open-folder-preview")
        updateUI()
      })
    })

    // Close folder preview
    document.querySelector("[data-close-folder-preview]")?.addEventListener("click", () => {
      folderPreviewOpen = null
      updateUI()
    })

    // Export CSV
    document.querySelector("#yt-sub-export-csv")?.addEventListener("click", exportCSV)

    // Selection Modal Trigger
    document.querySelector("#yt-sub-selection-trigger")?.addEventListener("click", () => {
      if (selectedIds.size > 0) {
        selectionModalOpen = true
        updateUI()
      }
    })

    // Close Selection Modal
    document.querySelector("[data-close-selection-modal]")?.addEventListener("click", () => {
      selectionModalOpen = false
      updateUI()
    })

    // Clear Selection
    document.querySelector("#yt-sub-clear-selection")?.addEventListener("click", () => {
      selectedIds.clear()
      selectionModalOpen = false
      updateUI()
    })

    // Remove item from selection modal
    document.querySelectorAll(".yt-sub-remove-selection").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-remove-id")
        selectedIds.delete(id)
        if (selectedIds.size === 0) selectionModalOpen = false
        updateUI()
      })
    })

    // Delete folder from preview
    document.querySelectorAll("[data-delete-folder]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        const folderId = el.getAttribute("data-delete-folder")
        if (confirm("Excluir esta pasta?")) {
          folders = folders.filter((f) => f.id !== folderId)
          saveFolders()
          folderPreviewOpen = null
          updateUI()
          showToast("Pasta excluída")
        }
      })
    })

    // Select all
    document.querySelector("#yt-sub-select-all")?.addEventListener("click", () => {
      if (selectedIds.size === channels.length && channels.length > 0) {
        selectedIds.clear()
      } else {
        channels.forEach((ch) => selectedIds.add(ch.id))
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
      dropdownOpen = !dropdownOpen
      updateUI()
    })

    // Dropdown options
    document.querySelector("[data-toggle-channels]")?.addEventListener("click", () => {
      showChannels = !showChannels
      saveVisibility()
      dropdownOpen = false
      updateUI()
    })

    document.querySelector("[data-toggle-folders]")?.addEventListener("click", () => {
      showFolders = !showFolders
      saveVisibility()
      dropdownOpen = false
      updateUI()
    })

    document.querySelector("[data-toggle-view]")?.addEventListener("click", () => {
      viewMode = viewMode === "sidebar" ? "modal" : "sidebar"
      localStorage.setItem("yt-view-mode", viewMode)
      dropdownOpen = false
      updateUI()
    })

    document.querySelector("[data-show-channels]")?.addEventListener("click", () => {
      showChannels = true
      saveVisibility()
      updateUI()
    })

    // Folder expand/collapse
    document.querySelectorAll("[data-toggle]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const folderId = el.getAttribute("data-toggle")
        if (expandedFolders.has(folderId)) {
          expandedFolders.delete(folderId)
        } else {
          expandedFolders.add(folderId)
        }
        updateUI()
      })
    })

    // Folder delete
    document.querySelectorAll("[data-delete]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.stopPropagation()
        const folderId = el.getAttribute("data-delete")
        if (confirm("Excluir esta pasta?")) {
          folders = folders.filter((f) => f.id !== folderId)
          saveFolders()
          updateUI()
          showToast("Pasta excluída")
        }
      })
    })

    // Channel selection
    document.querySelectorAll(".yt-sub-item[data-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id")
        if (selectedIds.has(id)) {
          selectedIds.delete(id)
        } else {
          selectedIds.add(id)
        }
        updateUI()
      })
    })

    // Mini item selection (APENAS para folder preview - não altera seleção, só visualiza)
    document.querySelectorAll(".yt-sub-mini-item[data-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-id")
        // Mini items apenas toggleiam a seleção visualmente
        if (selectedIds.has(id)) {
          selectedIds.delete(id)
        } else {
          selectedIds.add(id)
        }
        updateUI()
      })
    })

    // New folder
    document.querySelector("#yt-sub-new-folder")?.addEventListener("click", createNewFolder)

    // Export formats
    document.querySelector("#yt-sub-export-csv")?.addEventListener("click", () => exportChannels('csv'))
    document.querySelector("#yt-sub-export-json")?.addEventListener("click", () => exportChannels('json'))
    document.querySelector("#yt-sub-export-md")?.addEventListener("click", () => exportChannels('markdown'))

    // Backup/Restore
    document.querySelector("#yt-sub-backup-folders")?.addEventListener("click", backupFolders)
    document.querySelector("#yt-sub-restore-folders")?.addEventListener("click", restoreFolders)

    // Unsubscribe
    document.querySelector("#yt-sub-unsubscribe")?.addEventListener("click", bulkUnsubscribe)

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (dropdownOpen && !e.target.closest(".yt-sub-dropdown")) {
        dropdownOpen = false
        updateUI()
      }
    })
  }

  function createFAB() {
    if (document.querySelector("#yt-sub-fab")) return

    const fab = document.createElement("button")
    fab.id = "yt-sub-fab"
    fab.innerHTML = icons.grid
    fab.title = "Gerenciar Inscrições"

    fab.addEventListener("click", () => {
      panelOpen = !panelOpen
      if (panelOpen && channels.length === 0) {
        scrapeChannels()
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

      /* Sidebar mode */
      #yt-sub-panel.yt-sub-panel-sidebar {
        top: 0;
        right: 0;
        bottom: 0;
        width: 360px;
        max-width: 100vw;
      }
      #yt-sub-panel.yt-sub-panel-sidebar .yt-sub-sidebar {
        height: 100%;
        border-left: 1px solid #272727;
      }

      /* Modal mode */
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
        transition: background 0.2s;
      }
      .yt-sub-btn:hover:not(:disabled) { background: #3f3f3f; }
      .yt-sub-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .yt-sub-btn svg { width: 14px; height: 14px; }
      .yt-sub-btn-sm { padding: 6px 10px; font-size: 12px; }

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
        min-width: 180px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-8px);
        transition: all 0.2s;
        z-index: 100;
      }
      .yt-sub-dropdown.open .yt-sub-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(4px);
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
      }
      .yt-sub-dropdown-item:hover { background: #3f3f3f; }
      .yt-sub-dropdown-item svg { width: 16px; height: 16px; color: #aaa; }
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
    if (isOnChannelsPage()) {
      setTimeout(() => {
        scrapeChannels()
        console.log("[v0] Canais iniciais:", channels.length)
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
        channels = []
      } else {
        setTimeout(() => scrapeChannels(), 1500)
      }
      if (panelOpen) updateUI()
    }
  }).observe(document, { subtree: true, childList: true })
})()
