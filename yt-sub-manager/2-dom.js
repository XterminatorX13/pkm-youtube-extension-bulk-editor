// 2-dom.js - DOM manipulation, scraping, and bulk actions
; (() => {
    const { debugLog, showToast, updateUI, sleep, updateStatus, getChannelById, icons } = window.YTSubUtils
    const state = window.YTSubState
    const { t } = window.YTSubI18n

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
        const existingNames = new Set(state.channels.map((c) => c.name))
        const newChannels = [...state.channels] // Work with a copy to push

        const channelRenderers = document.querySelectorAll("ytd-channel-renderer, ytd-grid-channel-renderer")

        channelRenderers.forEach((el, i) => {
            const nameEl = el.querySelector("#channel-title, #text, yt-formatted-string#text")
            const imgEl = el.querySelector("#avatar img, yt-img-shadow img")
            const subsEl = el.querySelector("#subscribers, #subscriber-count")
            const subscribeBtn = el.querySelector("ytd-subscribe-button-renderer, #subscribe-button")
            const linkEl = el.querySelector("a#channel-title, ytd-channel-name a, a[href*='/@'], a[href*='/channel/']")

            if (nameEl) {
                const name = nameEl.innerText?.trim() || "Canal"
                if (!existingNames.has(name)) {
                    existingNames.add(name)
                    newChannels.push({
                        id: `ch-${Date.now()}-${i}`,
                        name: name,
                        avatar: imgEl?.src || "",
                        subscribers: subsEl?.innerText?.trim() || "",
                        element: el,
                        subscribeBtn: subscribeBtn,
                        href: linkEl?.href || "",
                    })
                }
            }
        })

        // Fallback para sidebar se não encontrar nada
        if (newChannels.length === 0) {
            const sidebarItems = document.querySelectorAll("#sections ytd-guide-entry-renderer")
            sidebarItems.forEach((el, i) => {
                const link = el.querySelector("a")
                const name = el.querySelector("yt-formatted-string")?.innerText?.trim()
                const img = el.querySelector("img")?.src
                const href = link?.href

                if (name && href && isValidYouTubeURL(href) && href.includes("/@") && !existingNames.has(name)) {
                    existingNames.add(name)
                    newChannels.push({
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

        state.channels = newChannels // Update global state
        debugLog("Total de canais:", state.channels.length)
        return state.channels
    }

    async function autoScrollAndLoad(maxScrolls = 20) {
        if (!isOnChannelsPage()) {
            showToast(t('toast_go_to_feed'))
            return
        }

        state.isAutoScrolling = true
        state.autoScrollProgress = { current: 0, total: maxScrolls, found: state.channels.length }
        updateUI()

        let previousCount = state.channels.length
        let noNewChannels = 0

        // Encontrar o container de scroll do YouTube
        const scrollContainer =
            document.querySelector("ytd-page-manager") || document.querySelector("#page-manager") || document.documentElement

        for (let i = 0; i < maxScrolls; i++) {
            state.autoScrollProgress.current = i + 1
            state.autoScrollProgress.found = state.channels.length
            updateUI()
            updateStatus(t('loading_progress', { current: i + 1, total: maxScrolls }))

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
            if (state.channels.length === previousCount) {
                noNewChannels++
                debugLog(`Nenhum canal novo na tentativa ${noNewChannels}`)
                if (noNewChannels >= 3) {
                    debugLog("Finalizando - sem novos canais")
                    break
                }
            } else {
                noNewChannels = 0
                debugLog(`Encontrados ${state.channels.length - previousCount} novos canais`)
            }

            previousCount = state.channels.length
        }

        // Volta ao topo suavemente
        window.scrollTo({ top: 0, behavior: "smooth" })

        state.isAutoScrolling = false
        state.autoScrollProgress.found = state.channels.length
        showToast(t('toast_loaded', { count: state.channels.length }))
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
            await new Promise((resolveConfirm) => {
                let attempts = 0
                const maxAttempts = 20 // 2 segundos max

                const waitForConfirmationButton = () => {
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
            const randomDelay = 250 + Math.random() * 250
            await sleep(randomDelay)

            resolve(true)
        })
    }

    async function bulkUnsubscribe() {
        if (state.selectedIds.size === 0 || state.isProcessing) return

        const toUnsubscribe = state.channels.filter((c) => state.selectedIds.has(c.id))

        if (
            !confirm(t('confirm_unsubscribe', { count: toUnsubscribe.length }))
        ) {
            return
        }

        state.isProcessing = true
        updateUI()

        // Criar Overlay de Progresso
        const overlay = document.createElement("div")
        overlay.className = "yt-sub-progress-overlay"
        overlay.innerHTML = `
      <div class="yt-sub-progress-box">
        <h3>${t('progress_unsubscribing')}</h3>
        <div class="yt-sub-progress-text">${t('progress_starting')}</div>
        <div class="yt-sub-progress-bar-bg">
          <div class="yt-sub-progress-bar-fill" style="width: 0%"></div>
        </div>
        <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-stop-btn">${t('progress_stop_btn')}</button>
      </div>
    `
        document.body.appendChild(overlay)

        let shouldStop = false
        document.getElementById("yt-sub-stop-btn").addEventListener("click", () => {
            shouldStop = true
            overlay.querySelector(".yt-sub-progress-text").textContent = t('progress_stopping')
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
        ${t('processing')}: ${channel.name}
      `
            overlay.querySelector(".yt-sub-progress-bar-fill").style.width = `${percent}%`

            const result = await unsubscribeChannel(channel)

            if (result) {
                success++
                consecutiveFailures = 0  // Reset on success
                state.selectedIds.delete(channel.id)
            } else {
                failed++
                consecutiveFailures++

                // Rate limit detection
                if (consecutiveFailures >= RATE_LIMIT_THRESHOLD) {
                    overlay.querySelector(".yt-sub-progress-text").innerHTML = `
            <strong style="color: #ff4e45;">${t('progress_rate_limit')}</strong><br>
            ${t('progress_rate_limit_desc')}<br><br>
            ${t('progress_stats', { success, failed })}
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

        state.isProcessing = false

        if (consecutiveFailures >= RATE_LIMIT_THRESHOLD) {
            showToast(t('progress_rate_limit'))
        } else {
            showToast(shouldStop ? t('cancel') : t('toast_loaded', { count: success })) // Reusing toast_loaded for completion count for now or just generic
        }

        // Limpa e re-scrapa
        state.channels = []
        scrapeChannels()
        updateUI()
    }

    // Export to global
    window.YTSubDom = {
        isOnChannelsPage,
        isValidYouTubeURL,
        scrapeChannels,
        autoScrollAndLoad,
        unsubscribeChannel,
        bulkUnsubscribe
    }
})()
