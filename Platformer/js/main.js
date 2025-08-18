// Entra in modalità schermo intero al caricamento della pagina
function enterFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }
}

let logContainerCreated = false;
function createLogContainer() {
    if (logContainerCreated) return;
    const display = document.getElementById('cheerpjDisplay');
    if (display) {
        const logDiv = document.createElement('div');
        logDiv.id = 'log-container';
        display.appendChild(logDiv);
        logContainerCreated = true;
    }
}

const observer = new MutationObserver(() => {
    createLogContainer();
});
observer.observe(document.body, { childList: true, subtree: true });

async function cheeerpjStartUp() {
    await cheerpjInit({ version: '17' });
    const container = document.querySelector('.platform-container');

    // Crea il display con un ID specifico all'interno del container
    cheerpjCreateDisplay(-1, -1, container, {
        width: '100%',
        height: '100%',
        id: 'cheerpjDisplay'
    });

    // Queue for log messages
    const logQueue = [];
    let logProcessing = false;

    function handleLogMessage(message) {
        logQueue.push(message);
        if (!logProcessing) processLogQueue();
        
        // Controlla se il gioco è completamente avviato
        if (message.includes('Game loop started successfully!') || 
            message.includes('Game panel created successfully!')) {
            
            setTimeout(() => {
                const style = document.createElement('style');
                style.textContent = `
                    .cheerpjNC::before,
                    .cheerpjNC::after {
                        all: unset !important;
                    }
                `;
                document.head.appendChild(style);
            }, 100);
        }
    }

    function processLogQueue() {
        if (logQueue.length === 0) {
            logProcessing = false;
            return;
        }
        logProcessing = true;
        const logContainer = document.getElementById('log-container');
        if (!logContainer) {
            setTimeout(processLogQueue, 100);
            return;
        }
        const msg = logQueue.shift();
        const p = document.createElement('p');
        p.textContent = msg;
        logContainer.prepend(p);

        setTimeout(() => {
            p.classList.add('fade-out');
        }, 5000);

        setTimeout(() => {
            if (logContainer.contains(p)) {
                logContainer.removeChild(p);
            }
        }, 6000);

        setTimeout(processLogQueue, 100);
    }

    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;

    console.warn = function(...args) {
        const message = args.join(' ');
        handleLogMessage('⚠️ ' + message);
        originalConsoleWarn.apply(console, args);
    };

    console.error = function(...args) {
        const message = args.join(' ');
        handleLogMessage('❌ ' + message);
        originalConsoleError.apply(console, args);
    };

    console.log = function(...args) {
        const message = args.join(' ');
        if (!message.includes('Log ricevuto:')) {
            handleLogMessage('' + message);
        }
        originalConsoleLog.apply(console, args);
    };

    await cheerpjRunJar('../app/Platformer.jar', {
        stdout: handleLogMessage,
        stderr: handleLogMessage
    });
}

// Avvia automaticamente quando la pagina si carica
window.addEventListener('load', () => {
    enterFullscreen();
    cheeerpjStartUp();
});
