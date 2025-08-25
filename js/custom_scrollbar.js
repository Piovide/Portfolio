function detectScrollbarSize() {
  var d = document.createElement('div');
  d.style.width = "100px";
  d.style.overflowY = "scroll";
  
  var d2 = document.createElement('div');
  d2.style.width = "100%";
  
  d.appendChild(d2);
  document.body.appendChild(d);
  var width = 100 - d2.offsetWidth;
  document.body.removeChild(d);
  
  return width;
}

function customScrollBar(element) {
  var position = element.querySelector(".position");
  var knob = element.querySelector(".knob");
  var content = element.querySelector(".content");
  var scrollbarSize = detectScrollbarSize();
  
  if (scrollbarSize == 0) {
  }else{
    content.style.right = -scrollbarSize + "px";
  }
  
  var mousepos = null;
  var knobpos = 0;
  knob.addEventListener("mousedown", function(event) {
    mousepos = event.clientY;
    event.preventDefault();
  });
  window.addEventListener("mousemove", function(event) {
    if (mousepos) {
      var diff = event.clientY - mousepos;
      mousepos = event.clientY;
      knobpos += diff;
      knobpos = Math.max(0, Math.min(position.offsetHeight - 100, knobpos))
      knob.style.transform = "translateY("+knobpos+"px)"
      event.preventDefault();
      
      var progress = (knobpos) / (position.offsetHeight - 100);
      content.scrollTop = progress * (content.scrollHeight - content.offsetHeight);
      
      // Muovi il background in base allo scroll
      updateBackgroundPosition(progress);
    }
  })
  window.addEventListener("mouseup", function(event) {
    if (mousepos) {
      mousepos = null;
    }
  })
  
  content.addEventListener('scroll', function() {
    var progress = content.scrollTop / (content.scrollHeight - content.offsetHeight);
    knobpos = progress * (position.offsetHeight - 100);
    knob.style.transform = "translateY("+knobpos+"px)"
    
    // Muovi il background in base allo scroll
    updateBackgroundPosition(progress);
  })
}

function updateBackgroundPosition(progress) {
  // Disabilita l'animazione del background su dispositivi mobili o con performance limitate
  if (window.innerWidth <= 767) {
    return;
  }
  
  // Verifica se l'utente preferisce animazioni ridotte
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  // Usa throttling per ridurre la frequenza degli aggiornamenti
  if (!updateBackgroundPosition.lastCall || Date.now() - updateBackgroundPosition.lastCall > 16) {
    updateBackgroundPosition.lastCall = Date.now();
    
    // Calcola la nuova posizione del background per coprire tutto il range
    // Da "top" (0%) quando progress = 0 a "bottom" (100%) quando progress = 1
    var backgroundPosition = "center " + (progress * 100) + "%";
    
    // Applica la posizione con throttling
    requestAnimationFrame(function() {
      document.body.style.backgroundPosition = backgroundPosition;
    });
  }
}

customScrollBar(document.querySelector(".scrollable"));