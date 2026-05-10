// script.js - Chatbot Frontend with Markdown Support

(function() {
    'use strict';

    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const welcomeMessage = document.querySelector('.welcome-message');

    // Conversation history (stored in memory)
    let conversationHistory = [];
    let isFirstMessage = true;

    // Initialize: focus on input
    userInput.focus();

    /**
     * Simple Markdown Parser
     * Handles: bold, italic, lists, line breaks, horizontal rules
     */
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

    /**
     * Add a message to the chat box
     * @param {string} text - Message content
     * @param {string} sender - 'user' or 'bot'
     * @returns {HTMLElement} - The created message element
     */
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

    /**
     * Create a temporary "Thinking..." message
     * @returns {HTMLElement} - The thinking message element
     */
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

    /**
     * Send conversation to backend and get AI response
     * @returns {Promise<string>} - The AI's response text
     */
    async function getAIResponse() {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.result;
    }

    /**
     * Handle form submission
     */
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

    // Event Listeners
    chatForm.addEventListener('submit', handleSubmit);

})();
