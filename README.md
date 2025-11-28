# YouTube Subscription Bulk Editor (Hybrid Version)

![YouTube Bulk Editor](https://img.shields.io/badge/YouTube-Extension-red) ![Status](https://img.shields.io/badge/Status-Experimental-orange)

Uma extensão poderosa e "híbrida" para gerenciar suas inscrições do YouTube em massa. Combina a melhor interface de usuário (Sidebar, Pastas) com uma lógica de "Smart Unsubscribe" robusta que evita bloqueios do YouTube.

## 🚀 Funcionalidades Principais

### 🛡️ Smart Bulk Unsubscribe
Diferente de outros scripts que tentam apagar tudo de uma vez e são bloqueados, esta extensão age como um "macro inteligente":
*   **Delays Randomizados:** Espera entre 250ms e 500ms entre ações para simular comportamento humano.
*   **Retry Logic:** Tenta encontrar os botões de confirmação múltiplas vezes caso o YouTube demore para carregar.
*   **Smooth Scrolling:** Rola a página suavemente até o canal que está sendo processado.
*   **Progress Overlay:** Uma tela de progresso visual com botão de **PARAR** para interromper o processo a qualquer momento.

### 📂 Gerenciamento Avançado
*   **Pastas:** Organize seus canais em pastas personalizadas.
*   **Mini Modal de Seleção:** Clique no contador (ex: `3/216`) para ver e gerenciar exatamente quais canais você selecionou antes de apagar.
*   **Exportar CSV:** Faça backup da sua lista de inscrições antes de fazer a limpa.
*   **Auto-Scroll:** Carrega todos os seus canais automaticamente sem precisar ficar rolando a página manualmente.

### 🎨 Interface Premium
*   **Modo Híbrido:** Alterne entre visualização de Sidebar (lateral) ou Modal (central).
*   **Busca em Tempo Real:** Filtre canais por nome instantaneamente.
*   **Dark Mode Nativo:** Design que se integra perfeitamente ao tema escuro do YouTube.

## 📦 Instalação

Como esta é uma versão experimental/desenvolvedor, você precisa instalá-la manualmente:

1.  Baixe este repositório como ZIP e extraia (ou faça um `git clone`).
2.  Abra o Chrome/Edge/Brave e vá para `chrome://extensions`.
3.  Ative o **Modo do Desenvolvedor** (canto superior direito).
4.  Clique em **Carregar sem compactação** (Load unpacked).
5.  Selecione a pasta onde você extraiu os arquivos.

## 🛠️ Como Usar

1.  Acesse [youtube.com/feed/channels](https://www.youtube.com/feed/channels).
2.  Clique no botão flutuante (ícone de grade) no canto inferior direito.
3.  **Dica:** Use o botão "Carregar Todos" para garantir que a extensão veja todas as suas inscrições.
4.  Selecione os canais que deseja remover (ou organize em pastas).
5.  Clique em **Cancelar Inscrição** e aguarde o processo terminar.

## ⚠️ Aviso Importante

Esta extensão usa automação de DOM (simula cliques). O YouTube pode alterar o layout do site a qualquer momento, o que pode quebrar a funcionalidade.
**Use com responsabilidade.** O "Smart Unsubscribe" é lento de propósito para proteger sua conta.

---
Desenvolvido por **XterminatorX13**
