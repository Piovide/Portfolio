function handleClick(e){
    e.preventDefault();
    const bars = document.querySelectorAll(".transiction-bar");
    const body = document.getElementsByTagName("body")[0];
    bars.forEach((bar, index) => {
        bar.style.animationPlayState = "running";
        body.style.overflow = "hidden";
    });
    const lastBar = bars[bars.length - 1];
    lastBar.addEventListener("animationend", () => {
            window.location = e.target.href;
            setTimeout(() => {
                bars.forEach(bar => {
                    bar.style.animationPlayState = "paused";
                    bar.style.animation = "none";
                    bar.offsetHeight;
                    bar.style.animation = "";
                });
                body.style.overflow = "auto";
            }, 100);
    });
}