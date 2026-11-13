// Motion belongs to the interface. Never animate or mutate simulation state.
const preference = matchMedia("(prefers-reduced-motion: reduce)");
const revealNodes = document.querySelectorAll("[data-reveal]");
if (!preference.matches && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        }
    }, { threshold: .08 });
    revealNodes.forEach((node) => { node.classList.add("reveal-ready"); observer.observe(node); });
    preference.addEventListener("change", () => {
        if (preference.matches) { observer.disconnect(); revealNodes.forEach((node) => node.classList.add("is-visible")); }
    });
}

// Native details retain keyboard behavior. Only the small revealed surface
// animates, so long settings panels never make the arena jump in a transition.
document.addEventListener("toggle", (event) => {
    const details = event.target;
    if (!(details instanceof HTMLDetailsElement) || !details.open || preference.matches) return;
    const content = [...details.children].find((child) => child.tagName !== "SUMMARY");
    if (!content || content.matches("canvas,script")) return;
    content.getAnimations().forEach((animation) => animation.cancel());
    content.animate([{ opacity: 0, translate: "0 5px" }, { opacity: 1, translate: "0 0" }], {
        duration: 180, easing: "cubic-bezier(.2,.7,.2,1)",
    });
}, true);

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || document.querySelector("dialog[open]")) return;
    for (const menu of document.querySelectorAll(".utility-menu[open],.view-menu[open],.home-tools[open]")) {
        menu.open = false;
        menu.querySelector("summary")?.focus({ preventScroll: true });
    }
});

document.addEventListener("click", (event) => {
    for (const menu of document.querySelectorAll(".home-tools[open]")) {
        if (!menu.contains(event.target)) menu.open = false;
    }
});

for (const player of document.querySelectorAll(".sound-reel audio")) {
    const update = () => { player.closest(".sound-reel").dataset.playing = String(!player.paused); };
    player.addEventListener("play", update);
    player.addEventListener("pause", update);
    player.addEventListener("ended", update);
}
