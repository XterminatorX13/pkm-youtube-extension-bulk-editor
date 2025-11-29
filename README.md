# 📺 YouTube Bulk Editor (Hybrid Edition)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge&logo=youtube)
![Status](https://img.shields.io/badge/status-stable-green?style=for-the-badge)
![Security](https://img.shields.io/badge/security-audited-brightgreen?style=for-the-badge&logo=shield)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)

**A ferramenta definitiva para limpar seu feed do YouTube.**
*Sem APIs pagas. Sem bloqueios. Sem dor de cabeça.*

[Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Segurança](#-segurança) • [Store Upload](#-como-publicar)

</div>

---

## 🚀 O Que É Isso?

Cansado de ter 1.000 inscrições que você não assiste mais? O YouTube não te deixa apagar tudo de uma vez. **Nós deixamos.**

Esta extensão é um "Frankenstein" (no bom sentido!) que combina:
1.  **UX Premium:** Interface lateral elegante, pastas e modo noturno.
2.  **Smart Core:** Um algoritmo de "unsubscribe" que age como um humano (pausas, rolagens) para evitar que sua conta seja marcada como spam.

## ✨ Funcionalidades

### 🛡️ Smart Unsubscribe (Anti-Ban)
> "Não é um bug, é uma feature."
O processo é intencionalmente "lento" (1-2s por canal). Por quê?
*   **Human-Like Delays:** Espera aleatória entre ações (250ms - 500ms).
*   **Scroll-to-View:** O script rola até o canal antes de clicar, simulando um usuário real.
*   **Retry Logic:** Se o YouTube lagar, o script espera pacientemente.

### 🎮 Controle Total
*   **Progress Overlay:** Acompanhe o progresso com uma tela visual estilo "hacker".
*   **Botão de Pânico:** Clicou em "PARAR"? O script para na hora.
*   **Mini Modal:** Clique no contador (`3/216`) para ver exatamente quem vai pra vala.

### 📂 Organização
*   **Pastas:** Agrupe canais que você quer manter (ex: "Tech", "Games").
*   **Export CSV:** Baixe sua lista completa antes de fazer a limpa. Backup é vida!
*   **Auto-Scroll:** Carrega sua lista infinita sozinho.

---

## 📦 Instalação (Developer Mode)

Como ainda não está na loja (veja abaixo como publicar!), instale assim:

1.  **Clone/Baixe** este repositório.
2.  Acesse `chrome://extensions` (Chrome/Brave/Edge) ou `about:debugging` (Firefox).
3.  Ative o **Modo do Desenvolvedor**.
4.  Clique em **Carregar sem compactação** (Load Unpacked).
5.  Selecione a pasta do projeto.
6.  Acesse [youtube.com/feed/channels](https://www.youtube.com/feed/channels) e divirta-se!

---

## 🔒 Segurança & Privacidade

Levamos a segurança a sério. Esta extensão passou por uma **auditoria de segurança completa** baseada em padrões OWASP 2024.

### ✅ Proteções Implementadas

| Ameaça | Mitigação | Status |
|--------|-----------|--------|
| **XSS (Cross-Site Scripting)** | `escapeHTML()` sanitiza todos os dados dinâmicos | ✅ Implementado |
| **Injeção de Dados** | localStorage com validação e try-catch | ✅ Implementado |
| **Injeção de Código** | CSP restritivo (`script-src 'self'`) | ✅ Implementado |
| **Open Redirect** | Validação de URLs do YouTube | ✅ Implementado |
| **Information Disclosure** | Logs de debug desativados em produção | ✅ Implementado |

### 🛡️ Padrões de Segurança

- **Manifest V3:** Atualizado para o novo padrão de segurança do Google
- **Permissões Mínimas:** Apenas `activeTab`, `storage`, e `youtube.com`
- **Sem Dados Externos:** Tudo fica no seu navegador (`localStorage`)
- **OWASP Compliant:** Segue as diretrizes do OWASP Browser Extension Security Project
- **CSP Explícito:** Bloqueia scripts remotos e eval()

### 📊 Relatório de Auditoria

**Rating de Segurança:** ✅ **APROVADO PARA PRODUÇÃO**  
**Compliance:** OWASP ✓ | Chrome Web Store ✓ | Firefox Add-ons ✓

Detalhes completos no [Security Audit Report](https://github.com/XterminatorX13/pkm-youtube-extension-bulk-editor/blob/funcional-experimental-migration-version/SECURITY_AUDIT.md).

### ⚠️ Aviso Legal
Esta ferramenta automatiza ações do usuário. Embora tenhamos implementado proteções (delays), o uso excessivo (milhares de ações por dia) pode chamar atenção do YouTube. Use com moderação (ex: 100-200 por dia).

---

## 🚀 Como Publicar (Store Guide)

Quer colocar isso na loja? Siga o guia:

### 🟢 Chrome Web Store (CWS)
1.  **Conta de Desenvolvedor:** Pague a taxa única de $5 USD.
2.  **Zip:** Compacte a pasta do projeto (sem a pasta `.git`).
3.  **Dashboard:** Vá para o [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard).
4.  **Upload:** Suba o ZIP.
5.  **Privacidade:** Preencha a "Privacy Policy". Como não coletamos dados, é simples.
    *   *Justificativa de Permissões:* Explique que `storage` é para salvar pastas locais e `activeTab` para injetar o script.
6.  **Review:** Aguarde 1-3 dias.

### 🦊 Firefox Add-ons (AMO)
1.  **Conta:** Crie uma conta no [AMO Developer Hub](https://addons.mozilla.org/developers/).
2.  **Zip:** O mesmo ZIP serve (o Firefox aceita Manifest V3 com algumas ressalvas, mas este projeto é compatível).
3.  **Upload:** Suba como "Self-Hosted" (para assinar e distribuir você mesmo) ou "Hosted" (para aparecer na loja).
4.  **Lint:** O validador automático vai checar o código. Se passar, vai para revisão humana.

---

<div align="center">

**Feito com 💻 e ☕ por XterminatorX13**

</div>
