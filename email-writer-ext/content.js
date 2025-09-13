const GMAIL_COMPOSE_TOOLBAR_SELECTOR = '.gU.Up,[role="toolbar"]';
const GMAIL_COMPOSE_TEXTBOX_SELECTOR = '[role="textbox"][g_editable="true"]';
const GMAIL_MESSAGE_CONTAINER_SELECTOR = 'div.adn';

/**
 * Finds the compose toolbar in the active compose window.
 * @returns {HTMLElement|null}
 */
function findComposeToolBar() {
    const toolbars = document.querySelectorAll(GMAIL_COMPOSE_TOOLBAR_SELECTOR);
    return toolbars.length > 0 ? toolbars[toolbars.length - 1] : null;
}

/**
 * Extracts the full email thread content from the page for better context.
 * @returns {string} The text content of the email thread.
 */
function getEmailContent() {
    const messageNodes = document.querySelectorAll(GMAIL_MESSAGE_CONTAINER_SELECTOR);
    if (messageNodes.length === 0) {
        const fallbackContainer = document.querySelector('.a3s.aiL, .GM');
        return fallbackContainer ? fallbackContainer.innerText.trim() : '';
    }
    return Array.from(messageNodes)
        .map(node => node.innerText.trim())
        .join('\n\n--- Next Message ---\n\n');
}

/**
 * Creates the 'AI Reply' button. All styling is now handled by content.css.
 * @returns {HTMLElement} The button element.
 */
function createAiButton() {
    const button = document.createElement('div');
    button.className = 'ai-reply-button';
    button.innerText = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

/**
 * Injects the generated reply safely into the compose box, handling paragraphs and line breaks.
 * @param {HTMLElement} composeBox The editable compose box element.
 * @param {string} replyText The text to inject.
 */
function injectReply(composeBox, replyText) {
    composeBox.innerHTML = '';
    const paragraphs = replyText.split(/\n\n/).filter(p => p.trim());
    paragraphs.forEach(pText => {
        const pElement = document.createElement('div');
        pElement.innerHTML = pText.trim().replace(/\n/g, '<br>');
        composeBox.appendChild(pElement);
    });
    composeBox.focus();
}

/**
 * Main handler for the AI button click event.
 * @param {Event} event The click event.
 */
async function handleAiButtonClick(event) {
    const button = event.currentTarget;
    const originalButtonText = button.innerText;
    try {
        button.innerText = 'Generating...';
        button.style.pointerEvents = 'none';

        const emailContent = getEmailContent();

        if (!emailContent) {
            throw new Error("Could not extract email content. Please ensure the email thread is visible.");
        }

        const res = await fetch('http://localhost:8080/api/email/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailContent, tone: "professional" })
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`API Request Failed: ${errorText}`);
        }

        const generatedReply = await res.text();
        const composeBox = document.querySelector(GMAIL_COMPOSE_TEXTBOX_SELECTOR);
        if (composeBox) {
            injectReply(composeBox, generatedReply);
        } else {
            throw new Error('Compose box was not found.');
        }

    } catch (error) {
        console.error("Email Assistant Error:", error);
        alert('Failed to generate reply. ' + error.message);
    } finally {
        const currentButton = document.querySelector('.ai-reply-button');
        if (currentButton) {
            currentButton.innerText = originalButtonText;
            currentButton.style.pointerEvents = 'auto';
        }
    }
}

/**
 * Injects the AI button into the toolbar if it doesn't already exist.
 */
function injectButton() {
    const toolbar = findComposeToolBar();
    if (!toolbar || toolbar.querySelector('.ai-reply-button')) {
        return;
    }

    const button = createAiButton();
    button.addEventListener('click', handleAiButtonClick);
    toolbar.insertBefore(button, toolbar.firstChild);
}

const observer = new MutationObserver(() => {
    if (document.querySelector(GMAIL_COMPOSE_TEXTBOX_SELECTOR) && !document.querySelector('.ai-reply-button')) {
        setTimeout(injectButton, 500);
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
