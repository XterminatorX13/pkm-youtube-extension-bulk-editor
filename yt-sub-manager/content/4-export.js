// 4-export.js - Export functionality (CSV/JSON/MD) (~320 lines)
(() => {
    const { state, showToast } = window.YTSub;

    function exportChannels(format = 'csv') {
        const { channels, folders } = state;

        if (channels.length === 0) {
            showToast("Nenhum canal para exportar!");
            return;
        }

        const timestamp = new Date().toISOString().slice(0, 10);
        let content = "";
        let mimeType = "";
        let filename = "";

        switch (format) {
            case 'csv':
                content = generateCSV(channels);
                mimeType = "text/csv;charset=utf-8;";
                filename = `youtube_subs_${timestamp}.csv`;
                break;

            case 'json':
                content = generateJSON(channels, folders);
                mimeType = "application/json;charset=utf-8;";
                filename = `youtube_subs_${timestamp}.json`;
                break;

            case 'markdown':
                content = generateMarkdown(channels, folders);
                mimeType = "text/markdown;charset=utf-8;";
                filename = `youtube_subs_${timestamp}.md`;
                break;

            default:
                showToast("Formato inválido!");
                return;
        }

        downloadFile(content, filename, mimeType);
        showToast(`Exportado como ${format.toUpperCase()}!`);
    }

    function generateCSV(channels) {
        const header = ["Nome do Canal", "Inscritos", "Link"];
        const rows = channels.map(c => [
            `"${c.name.replace(/"/g, '""')}"`,
            `"${c.subscribers || 'N/A'}"`,
            `"${c.href || '#'}"`
        ]);

        return [header, ...rows].map(row => row.join(",")).join("\n");
    }

    function generateJSON(channels, folders) {
        const data = {
            exportDate: new Date().toISOString(),
            totalChannels: channels.length,
            totalFolders: folders.length,
            channels: channels.map(c => ({
                id: c.id,
                name: c.name,
                subscribers: c.subscribers || "",
                url: c.href || "",
                avatar: c.avatar || "",
            })),
            folders: folders.map(f => ({
                id: f.id,
                name: f.name,
                channelIds: f.channels,
                channelCount: f.channels.length,
            })),
        };

        return JSON.stringify(data, null, 2);
    }

    function generateMarkdown(channels, folders) {
        let md = `# YouTube Subscriptions Export\n\n`;
        md += `**Exported:** ${new Date().toLocaleString()}\n`;
        md += `**Total Channels:** ${channels.length}\n`;
        md += `**Total Folders:** ${folders.length}\n\n`;
        md += `---\n\n`;

        // Folders section
        if (folders.length > 0) {
            md += `## 📁 Folders\n\n`;

            folders.forEach(folder => {
                md += `### ${folder.name}\n\n`;
                md += `**Channels:** ${folder.channels.length}\n\n`;

                folder.channels.forEach(channelId => {
                    const channel = channels.find(c => c.id === channelId);
                    if (channel) {
                        md += `- [${channel.name}](${channel.href || '#'})`;
                        if (channel.subscribers) {
                            md += ` - ${channel.subscribers}`;
                        }
                        md += `\n`;
                    }
                });

                md += `\n`;
            });

            md += `---\n\n`;
        }

        // All channels table
        md += `## 📺 All Channels\n\n`;
        md += `| Channel | Subscribers | Link |\n`;
        md += `|---------|-------------|------|\n`;

        channels.forEach(c => {
            const name = c.name.replace(/\|/g, '\\|');
            const subs = c.subscribers || 'N/A';
            const link = c.href || '#';
            md += `| ${name} | ${subs} | [Visit](${link}) |\n`;
        });

        return md;
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Export public API
    window.YTSub.export = {
        exportChannels,
    };
})();
