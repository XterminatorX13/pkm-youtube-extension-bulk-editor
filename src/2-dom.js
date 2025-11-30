// 2-dom.js - DOM scraping & unsubscribe logic (~420 lines)
(() => {
    const { state, debugLog, safeSetLocalStorage, sleep, showToast, updateUI } = window.YTSub;

    function isOnChannelsPage() {
        return location.href.includes("/feed/channels");
    }

    function isValidYouTubeURL(url) {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return ["youtube.com", "youtu.be"].some(h =>
                parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
            );
        } catch {
            return false;
        }
    }

    function scrapeChannels() {
        debugLog("Scraping canais...");
        const { channels } = state;
        const existingNames = new Set(channels.map(c => c.name));

        // Main channel renderers
        const renderers = document.querySelectorAll("ytd-channel-renderer, ytd-grid-channel-renderer");

        renderers.forEach((el, i) => {
            const nameEl = el.querySelector("#channel-title, #text, yt-formatted-string#text");
            const imgEl = el.querySelector("#avatar img, yt-img-shadow img");
            const subsEl = el.querySelector("#subscribers, #subscriber-count");
            const subscribeBtn = el.querySelector("ytd-subscribe-button-renderer, #subscribe-button");

            if (nameEl) {
                const name = nameEl.innerText?.trim() || "Canal";
                if (!existingNames.has(name)) {
                    existingNames.add(name);
                    channels.push({
                        id: `ch-${Date.now()}-${i}`,
                        name,
                        avatar: imgEl?.src || "",
                        subscribers: subsEl?.innerText?.trim() || "",
                        element: el,
                        subscribeBtn,
                    });
                }
            }
        });

        // Fallback sidebar
        if (channels.length === 0) {
            const sidebarItems = document.querySelectorAll("#sections ytd-guide-entry-renderer");
            sidebarItems.forEach((el, i) => {
                const link = el.querySelector("a");
                const name = el.querySelector("yt-formatted-string")?.innerText?.trim();
                const img = el.querySelector("img")?.src;
                const href = link?.href;

                if (name && href && isValidYouTubeURL(href) && href.includes("/@") && !existingNames.has(name)) {
                    existingNames.add(name);
                    channels.push({
                        id: `sb-${i}`,
                        name,
                        avatar: img || "",
                        subscribers: "",
                        element: el,
                        href,
                    });
                }
            });
        }

        debugLog("Total de canais:", channels.length);
        return channels;
    }

    async function autoScrollAndLoad(maxScrolls = 20) {
        if (!isOnChannelsPage()) {
            showToast("Vá para youtube.com/feed/channels primeiro!");
            return;
        }

        const { state } = window.YTSub;
        state.isAutoScrolling = true;
        state.autoScrollProgress = { current: 0, total: maxScrolls, found: state.channels.length };
        updateUI();

        let previousCount = state.channels.length;
        let noNewChannels = 0;

        for (let i = 0; i < maxScrolls; i++) {
            state.autoScrollProgress.current = i + 1;
            state.autoScrollProgress.found = state.channels.length;
            updateUI();

            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });

            const ytContent = document.querySelector('ytd-browse[page-subtype="channels"]');
            if (ytContent) {
                ytContent.scrollIntoView({ behavior: "smooth", block: "end" });
            }

            await window.YTSub.sleep(1800);
            scrapeChannels();

            if (state.channels.length === previousCount) {
                noNewChannels++;
                debugLog(`Nenhum canal novo na tentativa ${noNewChannels}`);
                if (noNewChannels >= 3) {
                    debugLog("Finalizando - sem novos canais");
                    break;
                }
            } else {
                noNewChannels = 0;
                debugLog(`Encontrados ${state.channels.length - previousCount} novos canais`);
            }

            previousCount = state.channels.length;
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
        state.isAutoScrolling = false;
        state.autoScrollProgress.found = state.channels.length;
        showToast(`Carregados ${state.channels.length} canais!`);
        updateUI();
    }

    async function unsubscribeChannel(channel) {
        return new Promise(async (resolve) => {
            debugLog("Iniciando cancelamento para:", channel.name);

            // Scroll to channel
            if (channel.element) {
                const rect = channel.element.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetY = rect.top + scrollTop - window.innerHeight / 2;
                window.scrollTo({ top: targetY, behavior: "smooth" });
                await window.YTSub.sleep(150);
            }

            // Find subscribe button
            const subscribeContainer = channel.element?.querySelector(
                "#subscribe-button, ytd-subscribe-button-renderer, [class*='subscribe']"
            );

            if (!subscribeContainer) {
                debugLog("Container não encontrado");
                resolve(false);
                return;
            }

            const subscribedBtn =
                subscribeContainer.querySelector("button, yt-button-shape button, yt-smartimation button, [role='button']") ||
                subscribeContainer;

            if (!subscribedBtn) {
                debugLog("Botão não encontrado");
                resolve(false);
                return;
            }

            // Click button
            subscribedBtn.click();
            await window.YTSub.sleep(150);

            // Wait for confirmation dialog
            await new Promise((resolveConfirm) => {
                let attempts = 0;
                const maxAttempts = 20;

                const waitForConfirmationButton = () => {
                    const selectors = [
                        "yt-confirm-dialog-renderer #confirm-button button",
                        "button[aria-label*='Cancelar']",
                        "button[aria-label*='Unsubscribe']",
                        "#confirm-button button",
                        "yt-button-renderer#confirm-button button",
                        "[aria-label='Cancelar inscrição']"
                    ];

                    let confirmBtn = null;
                    for (const selector of selectors) {
                        confirmBtn = document.querySelector(selector);
                        if (confirmBtn) break;
                    }

                    if (confirmBtn) {
                        confirmBtn.click();
                        debugLog("Confirmado com sucesso!");
                        resolveConfirm(true);
                    } else {
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(waitForConfirmationButton, 100);
                        } else {
                            debugLog("Timeout esperando confirmação");
                            document.body.click();
                            resolveConfirm(false);
                        }
                    }
                };

                waitForConfirmationButton();
            });

            // Random delay to avoid rate limiting
            const randomDelay = 250 + Math.random() * 250;
            await window.YTSub.sleep(randomDelay);

            resolve(true);
        });
    }

    async function bulkUnsubscribe() {
        const { state } = window.YTSub;
        if (state.selectedIds.size === 0 || state.isProcessing) return;

        const toUnsubscribe = state.channels.filter(c => state.selectedIds.has(c.id));

        if (!confirm(`Tem certeza que deseja cancelar ${toUnsubscribe.length} inscrição(ões)?\n\nIsso não pode ser desfeito!`)) {
            return;
        }

        state.isProcessing = true;
        updateUI();

        // Create progress overlay
        const overlay = document.createElement("div");
        overlay.className = "yt-sub-progress-overlay";
        overlay.innerHTML = `
      <div class="yt-sub-progress-box">
        <h3>Cancelando Inscrições...</h3>
        <div class="yt-sub-progress-text">Iniciando...</div>
        <div class="yt-sub-progress-bar-bg">
          <div class="yt-sub-progress-bar-fill" style="width: 0%"></div>
        </div>
        <button class="yt-sub-btn yt-sub-btn-danger" id="yt-sub-stop-btn">PARAR</button>
      </div>
    `;
        document.body.appendChild(overlay);

        let shouldStop = false;
        document.getElementById("yt-sub-stop-btn").addEventListener("click", () => {
            shouldStop = true;
            overlay.querySelector(".yt-sub-progress-text").textContent = "Parando...";
        });

        let success = 0;
        let failed = 0;
        let processed = 0;
        let consecutiveFailures = 0;
        const RATE_LIMIT_THRESHOLD = 3;

        for (const channel of toUnsubscribe) {
            if (shouldStop) break;

            processed++;
            const percent = Math.round((processed / toUnsubscribe.length) * 100);

            overlay.querySelector(".yt-sub-progress-text").innerHTML = `
        <strong>${processed}/${toUnsubscribe.length}</strong><br>
        Processando: ${channel.name}
      `;
            overlay.querySelector(".yt-sub-progress-bar-fill").style.width = `${percent}%`;

            const result = await unsubscribeChannel(channel);

            if (result) {
                success++;
                consecutiveFailures = 0;
                state.selectedIds.delete(channel.id);
            } else {
                failed++;
                consecutiveFailures++;

                if (consecutiveFailures >= RATE_LIMIT_THRESHOLD) {
                    overlay.querySelector(".yt-sub-progress-text").innerHTML = `
            <strong style="color: #ff4e45;">⚠️ Possível Rate Limit Detectado</strong><br>
            O YouTube pode estar bloqueando suas ações.<br>
            <span style="font-size: 12px;">Aguarde 5-10 minutos antes de tentar novamente.</span><br><br>
            <strong>Estatísticas:</strong><br>
            ✅ Sucesso: ${success}<br>
            ❌ Falhas: ${failed}
          `;
                    shouldStop = true;
                }
            }

            await window.YTSub.sleep(500 + Math.random() * 500);
        }

        // Final message
        overlay.querySelector(".yt-sub-progress-text").innerHTML = `
      <strong>Concluído!</strong><br>
      ✅ Sucesso: ${success}<br>
      ❌ Falhas: ${failed}<br><br>
      <button class="yt-sub-btn" onclick="this.closest('.yt-sub-progress-overlay').remove()">Fechar</button>
    `;
        overlay.querySelector("#yt-sub-stop-btn").remove();

        state.isProcessing = false;
        updateUI();
    }

    // Export public API
    window.YTSub.dom = {
        scrapeChannels,
        autoScrollAndLoad,
        unsubscribeChannel,
        bulkUnsubscribe,
        isOnChannelsPage,
        isValidYouTubeURL,
    };
})();
