// Esempio di utilizzo: crea un carousel per il progetto "project_1" nel container ".project-carousel-container"
document.addEventListener('DOMContentLoaded', function() {
    const carousels = document.querySelectorAll('.project-carousel');
    
    createProjectCarousel('project_1', carousels[0]);
    createProjectCarousel('project_2', carousels[1]);
});

async function createProjectCarousel(projectName, container) {
    if (!container) return;

    // Generate unique IDs for this carousel instance
    const carouselId = projectName + '-' + Math.random().toString(36).substr(2, 9);
    const prevBtnId = `carousel-prev-${carouselId}`;
    const nextBtnId = `carousel-next-${carouselId}`;

    // Carousel HTML structure
    container.innerHTML = `
    <div class="carousel-images"></div>
    <button id="${prevBtnId}" type="button" aria-label="Immagine precedente">&#10094;</button>
    <button id="${nextBtnId}" type="button" aria-label="Immagine successiva">&#10095;</button>
    `;

    let availableImages = [];
    let current = 0;
    let isAnimating = false;
    let allImagesLoaded = false;
    let lastDirection = 'prev'; // Traccia la direzione dell'ultima navigazione

    // Fetch all images from the project folder using fetch and directory listing (requires server-side support)
    async function fetchImages() {
    // Assumes a PHP/Apache directory listing is enabled
    // Example: GET res/projectName/ returns HTML with <a href="img1.png"> etc.
    try {
        const response = await fetch(`res/${projectName}/`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        availableImages = links
        .map(a => a.getAttribute('href'))
        .filter(href => /\.(png|jpg|jpeg|svg|webp|gif)$/i.test(href))
        .map(href => `res/${projectName}/${href}`);
    } catch (e) {
        availableImages = [];
    }
    initializeCarousel();
    }

    function createImg(src, index) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'carousel-img';
        img.alt = '';
        img.loading = 'lazy';
        img.dataset.index = index;
        img.style.opacity = '0';
        return img;
    }

    function initializeCarousel() {
        const carousel = container.querySelector('.carousel-images');
        const prevBtn = container.querySelector(`#${prevBtnId}`);
        const nextBtn = container.querySelector(`#${nextBtnId}`);
        const len = availableImages.length;

        if (len === 0) {
            carousel.innerHTML = '<span>Nessuna immagine disponibile riprova più tardi</span>';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }

        if (len === 1) {
            // Con una sola immagine, nascondi i pulsanti di navigazione
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else if (len === 2) {
            prevBtn.disabled = true;
            nextBtn.disabled = false;
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'block';
        } else {
            // Con più immagini, mostra i pulsanti di navigazione
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
        carousel.innerHTML = '';

        // Carica tutte le immagini e le mantiene nascoste
        availableImages.forEach((src, index) => {
            const img = createImg(src, index);
            carousel.appendChild(img);
        });

        allImagesLoaded = true;
        updateVisibleImages();
    }

    function updateVisibleImages() {
        if (!allImagesLoaded) return;
        
        const carousel = container.querySelector('.carousel-images');
        const len = availableImages.length;
        
        // Resetta tutte le immagini
        carousel.querySelectorAll('.carousel-img').forEach(img => {
            img.className = 'carousel-img';
            img.style.opacity = '0';
            img.style.position = 'absolute';
            img.style.animation = '';
            img.style.zIndex = '-1';
        });

        if (len === 1) {
            // Solo un'immagine
            const centerImg = carousel.querySelector(`[data-index="${current}"]`);
            centerImg.className = 'carousel-img carousel-center';
            centerImg.style.opacity = '1';
            centerImg.style.position = 'relative';
            centerImg.style.zIndex = '2';
        } else if (len === 2) {
            // Due immagini: mostra quella centrale e posiziona l'altra in base alla direzione
            const centerImg = carousel.querySelector(`[data-index="${current}"]`);
            centerImg.className = 'carousel-img carousel-center';
            centerImg.style.opacity = '1';
            centerImg.style.position = 'relative';
            centerImg.style.zIndex = '2';

            const otherIndex = (current + 1) % len;
            const otherImg = carousel.querySelector(`[data-index="${otherIndex}"]`);
            
            // Posiziona l'altra immagine in base alla direzione dell'ultima navigazione
            if (lastDirection === 'next') {
                otherImg.className = 'carousel-img carousel-left';
            } else {
                otherImg.className = 'carousel-img carousel-right';
            }
            otherImg.style.opacity = '0.6';
        } else if (len > 2) {
            // Tre o più immagini: layout completo
            const centerImg = carousel.querySelector(`[data-index="${current}"]`);
            centerImg.className = 'carousel-img carousel-center';
            centerImg.style.opacity = '1';
            centerImg.style.position = 'relative';
            centerImg.style.zIndex = '2';

            // Immagine sinistra
            const leftIndex = (current - 1 + len) % len;
            const leftImg = carousel.querySelector(`[data-index="${leftIndex}"]`);
            leftImg.className = 'carousel-img carousel-left';
            leftImg.style.opacity = '0.6';

            // Immagine destra
            const rightIndex = (current + 1) % len;
            const rightImg = carousel.querySelector(`[data-index="${rightIndex}"]`);
            rightImg.className = 'carousel-img carousel-right';
            rightImg.style.opacity = '0.6';
        }
    }

    function animateCarousel(direction) {
        if (isAnimating || availableImages.length === 0) return;
        
        isAnimating = true;
        lastDirection = direction; // Salva la direzione di navigazione
        const carousel = container.querySelector('.carousel-images');
        const len = availableImages.length;
        
        // Se c'è solo un'immagine, non fare nulla
        if (len <= 1) {
            isAnimating = false;
            return;
        }
        
        // Calcola nuovi indici
        const newCurrent = direction === 'next' 
            ? (current + 1) % len
            : (current - 1 + len) % len;
        
        // Elementi attuali
        const centerImg = carousel.querySelector(`[data-index="${current}"]`);
        const leftIndex = (current - 1 + len) % len;
        const rightIndex = (current + 1) % len;
        const leftImg = carousel.querySelector(`[data-index="${leftIndex}"]`);
        const rightImg = carousel.querySelector(`[data-index="${rightIndex}"]`);
        
        // Nuovi elementi che entreranno
        const newLeftIndex = (newCurrent - 1 + len) % len;
        const newRightIndex = (newCurrent + 1) % len;
        
        if (len === 2) {
            // Gestione semplificata per 2 immagini: swap diretto
            if (direction === 'next') {
                // Immagine corrente esce a sinistra
                if (centerImg) {
                    centerImg.style.animation = 'carousel-center-to-left 0.5s ease-in-out forwards';
                }
                // Immagine di destra diventa centrale
                if (rightImg) {
                    rightImg.style.animation = 'carousel-right-to-center 0.5s ease-in-out forwards';
                }
            } else {
                if (centerImg) {
                    centerImg.style.animation = 'carousel-center-to-right 0.5s ease-in-out forwards';
                }
                // Immagine di sinistra diventa centrale
                if (leftImg) {
                    leftImg.style.animation = 'carousel-left-to-center 0.5s ease-in-out forwards';
                }
            }
        } else if (len > 2) {
            // Gestione normale per 3+ immagini
            // Gestione normale per 3+ immagini
            if (direction === 'next') {
                // L'immagine centrale va verso sinistra
                if (centerImg) {
                    centerImg.style.animation = 'carousel-center-to-left 0.5s ease-in-out forwards';
                }
                
                // L'immagine di destra diventa centrale
                if (rightImg) {
                    rightImg.style.animation = 'carousel-right-to-center 0.5s ease-in-out forwards';
                    rightImg.className = 'carousel-img carousel-center';
                }
                
                // L'immagine di sinistra esce
                if (leftImg) {
                    leftImg.style.animation = 'carousel-fade-out-left 0.5s ease-in-out forwards';
                }
                
                // Nuova immagine entra da destra
                const newRightImg = carousel.querySelector(`[data-index="${newRightIndex}"]`);
                if (newRightImg) {
                    newRightImg.style.animation = 'carousel-fade-in-right 0.5s ease-in-out forwards';
                    newRightImg.className = 'carousel-img carousel-right';
                }
                
            } else {
                // L'immagine centrale va verso destra  
                if (centerImg) {
                    centerImg.style.animation = 'carousel-center-to-right 0.5s ease-in-out forwards';
                }
                
                // L'immagine di sinistra diventa centrale
                if (leftImg) {
                    leftImg.style.animation = 'carousel-left-to-center 0.5s ease-in-out forwards';
                    leftImg.className = 'carousel-img carousel-center';
                }
                
                // L'immagine di destra esce
                if (rightImg) {
                    rightImg.style.animation = 'carousel-fade-out-right 0.5s ease-in-out forwards';
                }
                
                // Nuova immagine entra da sinistra
                const newLeftImg = carousel.querySelector(`[data-index="${newLeftIndex}"]`);
                if (newLeftImg) {
                    newLeftImg.style.animation = 'carousel-fade-in-left 0.5s ease-in-out forwards';
                    newLeftImg.className = 'carousel-img carousel-left';
                }
            }
        }
        
        // Aggiorna l'indice corrente e termina l'animazione
        setTimeout(() => {
            current = newCurrent;
            updateVisibleImages();
            isAnimating = false;
        }, 500);
    }

    container.querySelector(`#${prevBtnId}`).addEventListener('click', function(e) {
        e.preventDefault();
        if (availableImages.length != 2){
            if (availableImages.length <= 1 || isAnimating) return;
            animateCarousel('prev');
        }else {
            if (availableImages.length <= 1 || isAnimating) return;
            animateCarousel('prev');
            const prevBtn = container.querySelector(`#${prevBtnId}`);
            if (prevBtn) {
                prevBtn.disabled = true;
                prevBtn.style.display = 'none';
            }
            const nextBtn = container.querySelector(`#${nextBtnId}`);
            if (nextBtn) {
                nextBtn.disabled = false;
                nextBtn.style.display = 'block';
            }
        }
    });

    container.querySelector(`#${nextBtnId}`).addEventListener('click', function(e) {
        e.preventDefault();
        if (availableImages.length != 2){
            if (availableImages.length <= 1 || isAnimating) return;
            animateCarousel('next');
        }else {
            if (availableImages.length <= 1 || isAnimating) return;
            animateCarousel('next');
            const prevBtn = container.querySelector(`#${prevBtnId}`);
            if (prevBtn) {
                prevBtn.disabled = false;
                prevBtn.style.display = 'block';
            }
            const nextBtn = container.querySelector(`#${nextBtnId}`);
            if (nextBtn) {
                nextBtn.disabled = true;
                nextBtn.style.display = 'none';
            }
        }
    });
    fetchImages();
}
