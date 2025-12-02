// 4-export.js - Export functionality (CSV, JSON, Markdown)
; (() => {
    const { debugLog, showToast } = window.YTSubUtils
    const state = window.YTSubState

    function exportChannels(format = 'csv') {
        if (state.channels.length === 0) {
            showToast("Nenhum canal para exportar!")
            return
        }

        const timestamp = new Date().toISOString().slice(0, 10)
        let content, mimeType, filename

        switch (format) {
            case 'csv':
                content = [
                    ["Nome do Canal", "Inscritos", "Link"],
                    ...state.channels.map(c => [
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
                    totalChannels: state.channels.length,
                    folders: state.folders.map(f => ({
                        name: f.name,
                        channels: f.channels.map(chId => {
                            const ch = state.channels.find(c => c.id === chId)
                            return ch ? { name: ch.name, subscribers: ch.subscribers, href: ch.href } : null
                        }).filter(Boolean)
                    })),
                    channels: state.channels.map(c => ({
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
                md += `**Total Channels:** ${state.channels.length}\n\n`

                // Folders
                if (state.folders.length > 0) {
                    md += `## 📁 Folders\n\n`
                    state.folders.forEach(f => {
                        md += `### ${f.name}\n\n`
                        f.channels.forEach(chId => {
                            const ch = state.channels.find(c => c.id === chId)
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
                state.channels.forEach(c => {
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

    // Export to global
    window.YTSubExport = {
        exportChannels,
        exportCSV
    }
})()
