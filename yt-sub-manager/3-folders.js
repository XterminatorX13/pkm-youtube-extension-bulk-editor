// 3-folders.js - Folder management (~380 lines)
(() => {
    const { state, safeSetLocalStorage, showToast, updateUI } = window.YTSub;

    function saveFolders() {
        safeSetLocalStorage("yt-folders", state.folders);
    }

    function saveVisibility() {
        safeSetLocalStorage("yt-show-channels", state.showChannels);
        safeSetLocalStorage("yt-show-folders", state.showFolders);
    }

    function createNewFolder() {
        const { selectedIds, folders, expandedFolders } = state;

        if (selectedIds.size === 0) {
            showToast("Selecione pelo menos um canal!");
            return;
        }

        const name = prompt("Nome da pasta:");
        if (!name?.trim()) return;

        const folder = {
            id: `folder-${Date.now()}`,
            name: name.trim(),
            channels: [...selectedIds],
        };

        folders.push(folder);
        saveFolders();
        selectedIds.clear();
        expandedFolders.add(folder.id);
        updateUI();
        showToast(`Pasta "${name}" criada com ${folder.channels.length} canais!`);
    }

    function deleteFolder(folderId) {
        const { folders } = state;
        const folder = folders.find(f => f.id === folderId);

        if (!folder) return;

        if (confirm(`Excluir pasta "${folder.name}"?`)) {
            state.folders = folders.filter(f => f.id !== folderId);
            saveFolders();
            updateUI();
            showToast(`Pasta "${folder.name}" excluída`);
        }
    }

    function addChannelsToFolder(folderId) {
        const { folders, selectedIds } = state;
        const folder = folders.find(f => f.id === folderId);

        if (!folder || selectedIds.size === 0) return;

        const existingChannels = new Set(folder.channels);
        let added = 0;

        selectedIds.forEach(id => {
            if (!existingChannels.has(id)) {
                folder.channels.push(id);
                added++;
            }
        });

        if (added > 0) {
            saveFolders();
            selectedIds.clear();
            updateUI();
            showToast(`${added} canal(is) adicionado(s) à pasta "${folder.name}"`);
        } else {
            showToast("Todos os canais já estão nesta pasta");
        }
    }

    function removeChannelFromFolder(folderId, channelId) {
        const { folders } = state;
        const folder = folders.find(f => f.id === folderId);

        if (!folder) return;

        folder.channels = folder.channels.filter(id => id !== channelId);
        saveFolders();
        updateUI();
    }

    function toggleFolderExpansion(folderId) {
        const { expandedFolders } = state;

        if (expandedFolders.has(folderId)) {
            expandedFolders.delete(folderId);
        } else {
            expandedFolders.add(folderId);
        }

        updateUI();
    }

    function backupFolders() {
        const { folders } = state;

        if (folders.length === 0) {
            showToast("Nenhuma pasta para fazer backup!");
            return;
        }

        const data = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            folders: folders,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `yt_folders_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);

        showToast(`Backup de ${folders.length} pastas criado!`);
    }

    function restoreFolders() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target.result);

                    if (!data.folders || !Array.isArray(data.folders)) {
                        throw new Error("Formato de backup inválido");
                    }

                    const { folders } = state;

                    if (folders.length > 0) {
                        const shouldMerge = confirm(
                            `Encontradas ${data.folders.length} pastas no backup.\n\n` +
                            `Você tem ${folders.length} pastas atualmente.\n\n` +
                            `OK = ADICIONAR às pastas existentes (merge)\n` +
                            `CANCELAR = SUBSTITUIR todas as pastas`
                        );

                        if (shouldMerge) {
                            // Merge mode
                            let added = 0;
                            data.folders.forEach(newFolder => {
                                const exists = folders.find(f => f.id === newFolder.id);
                                if (!exists) {
                                    folders.push(newFolder);
                                    added++;
                                }
                            });
                            showToast(`${added} pastas adicionadas (merge)`);
                        } else {
                            // Replace mode
                            state.folders = data.folders;
                            showToast(`${data.folders.length} pastas restauradas (substituição)`);
                        }
                    } else {
                        // No existing folders, just restore
                        state.folders = data.folders;
                        showToast(`${data.folders.length} pastas restauradas!`);
                    }

                    saveFolders();
                    updateUI();
                } catch (error) {
                    showToast(`Erro ao restaurar: ${error.message}`);
                    console.error("Restore error:", error);
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    function openFoldersModal() {
        state.foldersModalOpen = true;
        updateUI();
    }

    function closeFoldersModal() {
        state.foldersModalOpen = false;
        updateUI();
    }

    function openFolderPreview(folderId) {
        state.folderPreviewOpen = folderId;
        updateUI();
    }

    function closeFolderPreview() {
        state.folderPreviewOpen = null;
        updateUI();
    }

    // Export public API
    window.YTSub.folders = {
        createNewFolder,
        deleteFolder,
        addChannelsToFolder,
        removeChannelFromFolder,
        toggleFolderExpansion,
        backupFolders,
        restoreFolders,
        saveFolders,
        saveVisibility,
        openFoldersModal,
        closeFoldersModal,
        openFolderPreview,
        closeFolderPreview,
    };
})();
