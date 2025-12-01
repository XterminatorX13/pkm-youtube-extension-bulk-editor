# 📺 YouTube Bulk Manager

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=youtube)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)

**Gerencie e cancele inscrições do YouTube em massa - sem OAuth, sem APIs pagas.**

[Instalação](#-instalação) • [Funcionalidades](#-funcionalidades) • [FAQ](#-faq) • [Segurança](#-segurança)

</div>

---

## 🚀 Funcionalidades

- ✅ **Cancelamento em massa** com proteção anti-rate-limit
- 📁 **Organize em pastas** com tags visuais clicáveis
- 🔗 **Links diretos** para canais (hover)
- 📤 **Export** em CSV, JSON e Markdown
- 💾 **Backup/Restore** de configurações
- 🌐 **i18n** (Português + English)
- 🎨 **Modo sidebar** ou modal
- 🌙 **Dark mode** nativo

## 📦 Instalação

### Developer Mode (Recomendado)

1. Clone/baixe este repositório
2. Acesse `chrome://extensions` (Chrome/Edge) ou `about:debugging` (Firefox)
3. Ative **Modo do Desenvolvedor**
4. Clique em **Carregar sem compactação**
5. Selecione a pasta **`yt-sub-manager`**
6. Acesse [youtube.com/feed/channels](https://www.youtube.com/feed/channels)

### Chrome Web Store / Firefox Add-ons

*Em breve* - Veja [Como Publicar](#-como-publicar) para contribuir.

## 💡 Como Usar

1. **Vá para** [youtube.com/feed/channels](https://www.youtube.com/feed/channels)
2. **Clique no ícone** da extensão (canto superior direito)
3. **Carregue todos** os canais (botão "Carregar Todos")
4. **Selecione** os canais que deseja cancelar
5. **Organize** em pastas (opcional)
6. **Cancele** em massa ou exporte

### Dicas

- **Tags de pasta:** Clique nas tags `📁 Nome` para navegar até a pasta
- **Link do canal:** Passe o mouse sobre o canal para ver o link
- **Busca:** Use o campo de pesquisa para filtrar
- **Export antes de cancelar:** Sempre faça backup!

## ❓ FAQ

### Por que o cancelamento é "lento"?

Para evitar rate limiting do YouTube. O script simula comportamento humano com:
- Delays aleatórios (250-500ms)
- Scroll até o canal antes de clicar
- Retry automático em caso de falha

**Recomendação:** Não cancele mais de 100-200 canais por dia.

### Posso recuperar canais cancelados?

Não. O cancelamento é permanente. Por isso recomendamos:
1. Exportar sua lista antes (CSV/JSON)
2. Organizar em pastas os canais que quer manter
3. Revisar a seleção antes de confirmar

### A extensão coleta dados?

**Não.** Tudo fica no `localStorage` do seu navegador. Não há:
- ❌ Servidores externos
- ❌ Analytics
- ❌ Telemetria
- ❌ OAuth/APIs pagas

### Funciona em mobile?

Não. Extensões de navegador funcionam apenas em desktop (Chrome, Firefox, Edge, Brave).

### Por que não está na Chrome Web Store?

Ainda não foi publicada. Você pode:
- Usar em Developer Mode (100% funcional)
- Contribuir com a publicação (veja [Como Publicar](#-como-publicar))

## 🔒 Segurança

Esta extensão segue padrões **OWASP 2024** e **Manifest V3**:

- ✅ **XSS Protection:** Sanitização com `escapeHTML()`
- ✅ **CSP:** `script-src 'self'` (sem eval/inline)
- ✅ **Permissões mínimas:** Apenas `activeTab` e `storage`
- ✅ **URL Validation:** Bloqueia open redirects
- ✅ **No External Data:** Zero chamadas externas

**Auditoria completa:** [Security Report](./SECURITY_AUDIT.md)

## 🏗️ Arquitetura

Projeto modular com 8 arquivos:

```
yt-sub-manager/
├── 1-main.js          # Estado global + utils
├── 2-dom.js           # Scraping + unsubscribe
├── 3-folders.js       # CRUD de pastas
├── 4-export.js        # CSV/JSON/MD
├── 5-ui.js            # Renderização
├── 6-events.js        # Event listeners
├── 7-styles.js        # CSS injection
├── 8-i18n.js          # Traduções
└── _locales/          # en + pt_BR
```

## 🚀 Como Publicar

### Chrome Web Store

1. Pague taxa única de **$5 USD** no [Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
2. Compacte a pasta `yt-sub-manager` (sem `.git`)
3. Faça upload do ZIP
4. Preencha Privacy Policy (modelo: "não coletamos dados")
5. Aguarde revisão (1-3 dias)

### Firefox Add-ons

1. Crie conta no [AMO Developer Hub](https://addons.mozilla.org/developers/)
2. Use o mesmo ZIP do Chrome
3. Escolha "Hosted" (loja) ou "Self-Hosted" (distribuição própria)
4. Aguarde validação automática + revisão humana

## 🤝 Contribuindo

PRs são bem-vindos! Áreas prioritárias:

- [ ] Testes automatizados
- [ ] Seletor de pasta ao criar (dropdown)
- [ ] Cores customizadas para pastas
- [ ] Suporte a outros idiomas

## 📄 Licença

MIT License - Veja [LICENSE](./LICENSE)

---

<div align="center">

**Feito com 💻 e ☕**

[Report Bug](https://github.com/XterminatorX13/pkm-youtube-extension-bulk-editor/issues) • [Request Feature](https://github.com/XterminatorX13/pkm-youtube-extension-bulk-editor/issues)

</div>
