// Funzione per bloccare l'orientamento e gestire i cambiamenti
function lockOrientation() {
    // Prova a bloccare l'orientamento in landscape
    if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {
            // Se non riesce, usa altri metodi
            console.log('Orientamento non bloccabile, usando metodi alternativi');
        });
    }
    
    // Blocca lo zoom e il pinch
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, { passive: false });
    
    // Previene il double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Funzione per gestire i resize e orientamento
function handleResizeAndOrientation() {
    // Forza il refresh del layout delle applicazioni Java
    const cheerpjDisplay = document.getElementById('cheerpjDisplay');
    if (cheerpjDisplay) {
        // Forza il ricalcolo delle dimensioni
        cheerpjDisplay.style.width = '100%';
        cheerpjDisplay.style.height = '100%';
        
        // Trigger resize event per CheerpJ
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 100);
    }
}

// Funzione avanzata per detectare dispositivi mobili
function isMobileDevice() {
    // Controllo User Agent (può essere aggirato ma è un primo filtro)
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Controllo touch screen (più affidabile)
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    
    // Controllo dimensioni schermo fisiche
    const screenTooSmall = window.screen.width <= 768 || window.screen.height <= 768;
    
    // Controllo orientamento (i desktop raramente hanno orientamento)
    const hasOrientationAPI = 'orientation' in screen || 'orientation' in window;
    
    // Controllo memoria limitata (dispositivi mobili hanno meno RAM)
    const hasLimitedMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
    
    // Controllo connessione (dispositivi mobili spesso hanno connessioni più lente)
    const hasSlowConnection = navigator.connection && 
        (navigator.connection.effectiveType === 'slow-2g' || 
         navigator.connection.effectiveType === '2g' || 
         navigator.connection.effectiveType === '3g');
    
    // Controllo se è un tablet o telefono based su dimensioni e rapporto
    const aspectRatio = window.screen.width / window.screen.height;
    const isTabletSize = (aspectRatio > 0.6 && aspectRatio < 1.5) && screenTooSmall;
    
    // Se più di 2 condizioni sono vere, probabilmente è mobile
    const mobileIndicators = [
        userAgentMobile,
        hasTouchScreen,
        screenTooSmall,
        hasOrientationAPI,
        hasLimitedMemory,
        hasSlowConnection,
        isTabletSize
    ].filter(Boolean).length;
    
    return mobileIndicators >= 2;
}

// Funzione per monitorare cambiamenti di orientamento e ridimensionamento
function setupMobileMonitoring() {
    let warningShown = false;
    
    function checkAndShowWarning() {
        if (isMobileDevice() && !warningShown) {
            showMobileWarning();
            warningShown = true;
        }
    }
    
    // Controlla immediatamente
    checkAndShowWarning();
    
    // Monitora i cambiamenti di orientamento
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            checkAndShowWarning();
            handleResizeAndOrientation();
        }, 500); // Delay per permettere al browser di aggiornarsi
    });
    
    // Monitora il ridimensionamento della finestra
    window.addEventListener('resize', () => {
        setTimeout(() => {
            checkAndShowWarning();
            handleResizeAndOrientation();
        }, 100);
    });
    
    // Controllo periodico ogni 2 secondi
    setInterval(checkAndShowWarning, 2000);
}

// Funzione per mostrare messaggio di avviso per dispositivi mobili
function showMobileWarning() {
    const container = document.querySelector('.platform-container');
    
    // Nascondi il disclaimer quando mostri l'avviso mobile
    const disclaimer = document.querySelector('.disclaimer');
    if (disclaimer) {
        disclaimer.style.display = 'none';
    }
    
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
                max-width: 400px;
            ">
                <h2 style="margin-bottom: 20px; font-size: 24px;">⚠️ Dispositivo Non Supportato</h2>
                <p style="margin-bottom: 15px; line-height: 1.6;">
                    Questa applicazione è ottimizzata esclusivamente per computer desktop con mouse e tastiera a causa delle sue elevate richieste di prestazioni.
                </p>
                <p style="margin-bottom: 20px; line-height: 1.6; font-size: 14px; opacity: 0.8;">
                    Nota: Il cambio di orientamento o la modalità desktop del browser non risolveranno i problemi di compatibilità.
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
        if (message.includes('MapBuilder inizializzato correttamente') || 
            message.includes('MapBuilder avviato con successo!')) {
            
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

    await cheerpjRunJar('/app/Portfolio/MapBuilder/MapBuilder.jar', {
        stdout: handleLogMessage,
        stderr: handleLogMessage
    });
}

// Avvia automaticamente quando la pagina si carica
window.addEventListener('load', () => {
    // Inizializza il blocco orientamento
    lockOrientation();
    
    // Usa il nuovo sistema di monitoraggio dispositivi mobili
    setupMobileMonitoring();
    
    // Se non è rilevato come mobile, procedi con l'applicazione
    if (!isMobileDevice()) {
        enterFullscreen();
        cheeerpjStartUp();
    }
});
