// Performance detector per ottimizzare automaticamente il sito
(function() {
    'use strict';
    
    let isLowPerformanceDevice = false;
    
    // Funzione per rilevare le capacità del dispositivo
    function detectDeviceCapabilities() {
        const userAgent = navigator.userAgent.toLowerCase();
        const deviceMemory = navigator.deviceMemory || 4; // Default 4GB se non supportato
        const hardwareConcurrency = navigator.hardwareConcurrency || 4; // Default 4 core
        
        // Test per rilevare se l'accelerazione hardware è attiva
        function testHardwareAcceleration() {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return false;
            
            const renderer = gl.getParameter(gl.RENDERER);
            const vendor = gl.getParameter(gl.VENDOR);
            
            // Controlla se sta usando software rendering
            return !(renderer.includes('Software') || renderer.includes('Microsoft') || vendor.includes('Microsoft'));
        }
        
        // Fattori che indicano un dispositivo a bassa performance
        const lowPerformanceIndicators = [
            deviceMemory < 4, // Meno di 4GB RAM
            hardwareConcurrency < 4, // Meno di 4 core
            !testHardwareAcceleration(), // Nessuna accelerazione hardware
            userAgent.includes('mobile'), // Dispositivo mobile
            window.matchMedia('(prefers-reduced-motion: reduce)').matches, // Utente preferisce meno animazioni
            window.devicePixelRatio < 2 // Schermo a bassa densità
        ];
        
        // Se 2 o più indicatori sono veri, consideriamo il dispositivo a bassa performance
        isLowPerformanceDevice = lowPerformanceIndicators.filter(Boolean).length >= 2;
        
        return isLowPerformanceDevice;
    }
    
    // Applica ottimizzazioni se necessario
    function applyPerformanceOptimizations() {
        if (!isLowPerformanceDevice) return;
        
        document.documentElement.classList.add('low-performance');
        
        // Disabilita animazioni non essenziali
        const style = document.createElement('style');
        style.textContent = `
            .low-performance * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .low-performance .carousel-img:hover {
                transform: none !important;
            }
            
            .low-performance .knob:hover {
                transform: none !important;
                box-shadow: none !important;
            }
            
            .low-performance .skill-level {
                transition: width 0.3s ease !important;
            }
            
            /* Disabilita il movimento del background completamente */
            .low-performance body {
                background-attachment: scroll !important;
            }
        `;
        
        document.head.appendChild(style);
        
        console.log('Ottimizzazioni per dispositivi a bassa performance attivate');
    }
    
    // Aggiungi throttling agli event listener di scroll
    function throttleScrollEvents() {
        let scrollTimeout;
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'scroll' && isLowPerformanceDevice) {
                const throttledListener = function(event) {
                    if (scrollTimeout) return;
                    scrollTimeout = setTimeout(() => {
                        listener.call(this, event);
                        scrollTimeout = null;
                    }, 16); // ~60fps
                };
                
                return originalAddEventListener.call(this, type, throttledListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
    
    // Inizializzazione
    function init() {
        detectDeviceCapabilities();
        applyPerformanceOptimizations();
        
        if (isLowPerformanceDevice) {
            throttleScrollEvents();
            
            // Riduci la qualità delle immagini se possibile
            document.addEventListener('DOMContentLoaded', function() {
                const images = document.querySelectorAll('img');
                images.forEach(img => {
                    if (img.loading === 'lazy') {
                        img.loading = 'lazy';
                        img.decoding = 'async';
                    }
                });
            });
        }
    }
    
    // Avvia l'inizializzazione il prima possibile
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Esponi funzioni per debug
    window.performanceDetector = {
        isLowPerformance: () => isLowPerformanceDevice,
        getDeviceInfo: () => ({
            memory: navigator.deviceMemory,
            cores: navigator.hardwareConcurrency,
            pixelRatio: window.devicePixelRatio,
            userAgent: navigator.userAgent
        })
    };
})();
