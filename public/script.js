// script.js - Chatbot Frontend with Markdown Support & Settings

(function() {
    'use strict';

    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const welcomeMessage = document.querySelector('.welcome-message');

    // Settings DOM Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const cancelSettingsBtn = document.getElementById('cancel-settings');
    const saveSettingsBtn = document.getElementById('save-settings');
    const modelSelect = document.getElementById('model-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const toggleApiVisibilityBtn = document.getElementById('toggle-api-visibility');

    // Conversation history (stored in memory)
    let conversationHistory = [];
    let isFirstMessage = true;

    // Settings (with localStorage)
    const SETTINGS = {
        model: localStorage.getItem('gemini_model') || 'gemini-2.5-flash',
        apiKey: localStorage.getItem('gemini_api_key') || ''
    };

    // Initialize: load settings and focus input
    function init() {
        // Load saved settings into UI
        modelSelect.value = SETTINGS.model;
        apiKeyInput.value = SETTINGS.apiKey;

        // Focus on input
        userInput.focus();
    }

    // ===== Settings Functions =====

    function openSettings() {
        settingsModal.classList.add('active');
        // Reset to current saved values
        modelSelect.value = SETTINGS.model;
        apiKeyInput.value = SETTINGS.apiKey;
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    function saveSettings() {
        const newModel = modelSelect.value;
        const newApiKey = apiKeyInput.value.trim();

        // Save to localStorage
        localStorage.setItem('gemini_model', newModel);
        if (newApiKey) {
            localStorage.setItem('gemini_api_key', newApiKey);
        } else {
            localStorage.removeItem('gemini_api_key');
        }

        // Update settings
        SETTINGS.model = newModel;
        SETTINGS.apiKey = newApiKey;

        closeSettings();

        // Show confirmation
        addSystemMessage('Settings saved! Model: ' + newModel);
    }

    function toggleApiVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiVisibilityBtn.innerHTML = `
                <svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
            `;
        } else {
            apiKeyInput.type = 'password';
            toggleApiVisibilityBtn.innerHTML = `
                <svg class="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
        }
    }

    function addSystemMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'system-message';
        msgDiv.style.cssText = 'text-align: center; color: var(--text-muted); font-size: 12px; margin: 8px 0;';
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;

        // Auto-remove after 3 seconds
        setTimeout(() => msgDiv.remove(), 3000);
    }

    // ===== Markdown Parser =====

    function parseMarkdown(text) {
        // Escape HTML first (security)
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Code blocks (must be before other processing)
        html = html.replace(/```(\w*)([\s\S]*?)```/g, '<pre><code>$2</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold text **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic text *text*
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Horizontal rules --- or ***
        html = html.replace(/^(\-{3,}|\*{3,})$/gm, '<hr>');

        // Unordered lists
        html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Ordered lists
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>');

        // Headers ## or ###
        html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>');

        // Line breaks (double newline becomes paragraph break)
        html = html.replace(/\n\n+/g, '</p><p>');

        // Single line breaks
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraph if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }

        return html;
    }

    // ===== Chat Functions =====

    function addMessageToChat(text, sender) {
        // Remove welcome message on first message
        if (isFirstMessage && welcomeMessage) {
            welcomeMessage.style.display = 'none';
            isFirstMessage = false;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (sender === 'bot') {
            // Parse markdown for bot messages
            contentDiv.innerHTML = parseMarkdown(text);
        } else {
            // Plain text for user messages (escape HTML)
            contentDiv.textContent = text;
        }

        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);

        // Auto-scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        return messageDiv;
    }

    function showThinkingMessage() {
        // Remove welcome message if still visible
        if (isFirstMessage && welcomeMessage) {
            welcomeMessage.style.display = 'none';
            isFirstMessage = false;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot thinking';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = 'Thinking <span class="thinking-dots"><span></span><span></span><span></span></span>';

        messageDiv.appendChild(contentDiv);
        chatBox.appendChild(messageDiv);

        // Auto-scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;

        return messageDiv;
    }

    async function getAIResponse() {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation: conversationHistory,
                model: SETTINGS.model,
                apiKey: SETTINGS.apiKey || null
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const userMessage = userInput.value.trim();

        // Validate input
        if (!userMessage) {
            userInput.focus();
            return;
        }

        // Clear input field
        userInput.value = '';

        // Add user message to chat UI
        addMessageToChat(userMessage, 'user');

        // Add user message to conversation history
        conversationHistory.push({
            role: 'user',
            text: userMessage
        });

        // Show "Thinking..." message
        const thinkingElement = showThinkingMessage();

        try {
            // Get AI response from backend
            const botResponse = await getAIResponse();

            // Remove thinking message
            thinkingElement.remove();

            // Check if we received a valid response
            if (botResponse && botResponse.trim() !== '') {
                // Add bot message with markdown parsing
                addMessageToChat(botResponse, 'bot');

                // Add bot response to conversation history
                conversationHistory.push({
                    role: 'model',
                    text: botResponse
                });
            } else {
                addMessageToChat('Sorry, no response received.', 'bot');
            }

        } catch (error) {
            console.error('Error getting AI response:', error);
            thinkingElement.remove();
            addMessageToChat('Failed to get response from server. Please try again.', 'bot');
        }

        // Re-focus input for next message
        userInput.focus();
    }

    // ===== Event Listeners =====

    // Chat form
    chatForm.addEventListener('submit', handleSubmit);

    // Settings modal
    settingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    cancelSettingsBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    toggleApiVisibilityBtn.addEventListener('click', toggleApiVisibility);

    // Close modal on overlay click
    settingsModal.querySelector('.modal-overlay').addEventListener('click', closeSettings);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeSettings();
        }
    });

    // Example prompt buttons
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            userInput.value = prompt;
            userInput.focus();
            // Trigger submit
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Initialize
    init();

})();
