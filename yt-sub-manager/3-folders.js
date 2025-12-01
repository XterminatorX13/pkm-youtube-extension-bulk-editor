// 3-folders.js - Folder management, backup, and restore
; (() => {
    const { debugLog, showToast, updateUI, saveFolders, getChannelById } = window.YTSubUtils
    const state = window.YTSubState

    function backupFolders() {
        if (state.folders.length === 0) {
            showToast("Nenhuma pasta para fazer backup!")
            return
        }

        const data = {
            version: "1.0.0",
            exportDate: new Date().toISOString(),
            folders: state.folders,
            totalFolders: state.folders.length
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json;charset=utf-8;"
        })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `youtube_folders_backup_${new Date().toISOString().slice(0, 10)}.json`
        link.click()
        showToast(`✅ Backup de ${state.folders.length} pastas criado!`)
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

                    if (state.folders.length === 0) {
                        // No existing folders, just import
                        state.folders = data.folders
                        saveFolders()
                        updateUI()
                        showToast(`✅ ${data.folders.length} pastas restauradas!`)
                        return
                    }

                    // Ask user: merge or replace?
                    const shouldMerge = confirm(
                        `Encontradas ${data.folders.length} pastas no backup.\n\n` +
                        `Você tem ${state.folders.length} pastas atualmente.\n\n` +
                        `OK = ADICIONAR às pastas existentes (merge)\n` +
                        `CANCELAR = SUBSTITUIR todas as pastas`
                    )

                    if (shouldMerge) {
                        // Merge: add only new folders (by ID)
                        let added = 0
                        data.folders.forEach(f => {
                            if (!state.folders.find(existing => existing.id === f.id)) {
                                state.folders.push(f)
                                added++
                            }
                        })
                        showToast(`✅ ${added} pastas adicionadas (${state.folders.length} total)`)
                    } else {
                        // Replace all
                        state.folders = data.folders
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

    function deleteFolder(folderId) {
        if (confirm("Excluir esta pasta?")) {
            state.folders = state.folders.filter((f) => f.id !== folderId)
            saveFolders()
            state.folderPreviewOpen = null
            updateUI()
            showToast("Pasta excluída")
        }
    }

    // Export to global
    window.YTSubFolders = {
        backupFolders,
        restoreFolders,
        deleteFolder
    }
})()
