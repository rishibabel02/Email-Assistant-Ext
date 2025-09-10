console.log("Email Assistant - content script loaded") 

function findComposeToolBar(){
 const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    

    for(const selector of selectors){
        const toolbar = document.querySelector(selector)

        if(toolbar) return toolbar;
        return null;
    }
}

function createAIButton(){
   const button = document.createElement('div');
   button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.background = '#0b57d0';
    button.style.color = '#fff';
   button.style.marginRight = '8px'
   button.innerHTML = 'AI Reply'
   button.setAttribute('role', 'button')
   button.setAttribute('data-tooltip', 'Generate AI Reply')

   return button;
}

function getEmailContent(){
 const selectors = [
        '.h7',
        '.a3s.aiL',
        'gmail_quote',
        '[role="presentation"]'
    ];

    for(const selector of selectors){
        const content = document.querySelector(selector)

        if(content) return content.innerText.trim(); 
    }
    return '';
}

function injectButton(){
    const existingButton = document.querySelector('.ai-reply');

    if(existingButton) existingButton.remove();

    const toolBar = findComposeToolBar();
    if(!toolBar){
        console.log("ToolBar not found")
        return;
    }


     const button = createAIButton();
     button.classList.add('ai-reply');

     button.addEventListener('click', async() => {
        try{
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();

            const res = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({
                    emailContent : emailContent,
                    tone: "professional"
                })
            });

            if(!res.ok){
                throw new Error('Api Req Failed!')
            }

            const generatedReply = await res.text()

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]')

           if (composeBox) {
            composeBox.focus();
          
            const paragraphs = generatedReply.split(/\n\n/).filter(p => p.trim());
            composeBox.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');


        } else{
            console.log('Compose box was not found')
        }
        }catch(error){
            console.log(error)
            alert('Failed to generate reply')
        } finally{
            button.innerHTML = 'AI Reply'
            button.disabled = false;
        }
     })

     toolBar.insertBefore(button, toolBar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        const addedNodes = Array.from(mutation.addedNodes);

        const hasComposeElements = addedNodes.some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );

        if(hasComposeElements) {
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
})

