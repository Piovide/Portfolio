document.addEventListener('DOMContentLoaded', function() {
    // Funzione per animare le skill bar
    function animateSkillBars() {
        const skillLevels = document.querySelectorAll('.skill-level');
        let lastScrollY = window.scrollY;
        let scrollDirection = 'down';

        // Monitora la direzione dello scroll
        function updateScrollDirection() {
            const currentScrollY = window.scrollY;
            scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
            lastScrollY = currentScrollY;
        }

        // Aggiungi listener per il scroll
        window.addEventListener('scroll', updateScrollDirection, { passive: true });

        // Crea un Intersection Observer
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    // Quando entra nella vista - anima le skill bar
                    const skillLevelsArray = Array.from(skillLevels);
                    
                    // Se si sta scrollando verso l'alto, inverti l'ordine
                    const orderedSkillLevels = scrollDirection === 'up' 
                        ? skillLevelsArray.reverse() 
                        : skillLevelsArray;
                    
                    orderedSkillLevels.forEach(function(skillLevel, index) {
                        const percentage = skillLevel.getAttribute('data-percentage');
                        
                        setTimeout(function() {
                            // Imposta la variabile CSS per la larghezza target
                            skillLevel.style.setProperty('--target-width', percentage + '%');
                            // Aggiungi la classe per attivare l'animazione
                            skillLevel.classList.add('animate');
                        }, index * 100); // 100ms di ritardo tra una barra e l'altra
                    });
                } else {
                    // Quando esce dalla vista - resetta le skill bar
                    skillLevels.forEach(function(skillLevel) {
                        // Rimuovi la classe di animazione
                        skillLevel.classList.remove('animate');
                        // Resetta la larghezza a 0
                        skillLevel.style.setProperty('--target-width', '0%');
                    });
                }
            });
        }, {
            threshold: 0.2, // Attiva quando il 20% della sezione skills è visibile
            rootMargin: '0px 0px -50px 0px' // Margine per attivare l'animazione un po' prima
        });

        // Osserva la sezione skills
        const skillsBlock = document.querySelector('.skills-block');
        if (skillsBlock) {
            observer.observe(skillsBlock);
        }
    }

    // Avvia l'animazione
    animateSkillBars();
});
