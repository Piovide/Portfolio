// Funzione per detectare dispositivi mobili
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// Funzione per mostrare messaggio di avviso per dispositivi mobili
function showMobileWarning() {
    const container = document.querySelector('.platform-container');
    container.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 30px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                max-width: 90%;
            ">
                <h2 style="margin-bottom: 20px; font-size: 24px;">⚠️ Dispositivo Non Supportato</h2>
                <p style="margin-bottom: 15px; line-height: 1.6;">
                    Questa applicazione è ottimizzata solo per computer desktop a causa delle sue elevate richieste di prestazioni e periferiche specifiche.
                </p>
                <p style="margin-bottom: 20px; line-height: 1.6;">
                    Per una migliore esperienza, ti consigliamo di visitare questa sezione da un computer.
                </p>
                <button onclick="window.history.back()" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'">
                    ← Torna Indietro
                </button>
            </div>
        </div>
    `;
}

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
    await cheerpjInit({ 
        version: '17',
        preloadProgress: (current, total) => {
            console.log(`Preloading: ${current}/${total}`);
        },
        enableInputMethods: true
    });
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

    try {
        await cheerpjRunJar('/app/Portfolio/Platformer/Platformer.jar', {
            stdout: handleLogMessage,
            stderr: handleLogMessage
        });
    } catch (error) {
        console.error('Errore nel caricamento del JAR:', error);
        handleLogMessage('❌ Errore nel caricamento del JAR: ' + error.message);
    }
}

// Avvia automaticamente quando la pagina si carica
window.addEventListener('load', () => {
    // Controlla se è un dispositivo mobile
    if (isMobileDevice()) {
        showMobileWarning();
        return; // Non continua con il caricamento dell'applicazione Java
    }
    
    enterFullscreen();
    cheeerpjStartUp();
});
