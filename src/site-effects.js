// The moving backdrop is DOM/CSS presentation, outside every battle/export
// canvas. Its own seeded layout never consumes the gameplay RNG.
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const mobile = matchMedia("(max-width:760px)").matches;
let randomState = 0x4f524253;
const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
};
const scene = document.createElement("div");
scene.className = "site-atmosphere";
scene.setAttribute("aria-hidden", "true");
scene.innerHTML = '<div class="scene-glow scene-glow-one"></div><div class="scene-glow scene-glow-two"></div><div class="scene-orbits"><i></i><i></i><i></i></div><div class="scene-type scene-type-one"><div><span>ORB FOUNDRY&nbsp; / &nbsp;ORB RACER&nbsp; / &nbsp;</span><span>ORB FOUNDRY&nbsp; / &nbsp;ORB RACER&nbsp; / &nbsp;</span></div></div><div class="scene-type scene-type-two"><div><span>WATCH IT UNFOLD&nbsp; / &nbsp;PICK YOUR SIDE&nbsp; / &nbsp;</span><span>WATCH IT UNFOLD&nbsp; / &nbsp;PICK YOUR SIDE&nbsp; / &nbsp;</span></div></div><div class="scene-particles"></div>';
const particles = scene.querySelector(".scene-particles");
for (let index = 0; index < (mobile ? 44 : 100); index += 1) {
    const particle = document.createElement("i");
    particle.className = index % 9 === 0 ? "scene-spark" : "scene-dot";
    particle.style.cssText = `--x:${(random() * 100).toFixed(2)}%;--y:${(random() * 100).toFixed(2)}%;--size:${(1.2 + random() * 2.5).toFixed(2)}px;--dx:${(random() * 180 - 90).toFixed(1)}px;--dy:${(-90 - random() * 210).toFixed(1)}px;--duration:${(9 + random() * 19).toFixed(2)}s;--delay:${(-random() * 30).toFixed(2)}s;--alpha:${(.2 + random() * .55).toFixed(2)};`;
    particles.append(particle);
}
document.body.prepend(scene);

function animateTitle() {
    const title = document.querySelector("#menuTitle");
    if (!title) return;
    const text = title.textContent;
    title.setAttribute("aria-label", text);
    title.replaceChildren(...[...text].map((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter === " " ? "\u00a0" : letter;
        span.className = "kinetic-letter";
        span.style.setProperty("--letter", index);
        span.setAttribute("aria-hidden", "true");
        return span;
    }));
}
function updateMode() {
    const racer = document.documentElement.dataset.homeMode === "orb-race";
    scene.dataset.mode = racer ? "orb-race" : "classic";
    animateTitle();
}
document.addEventListener("orb-home-mode-change", updateMode);
document.addEventListener("visibilitychange", () => { scene.dataset.paused = String(document.hidden); });
let pointerFrame = 0;
let pointerX = 0;
let pointerY = 0;
if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.addEventListener("pointermove", (event) => {
        if (reduce.matches) return;
        pointerX = (event.clientX / innerWidth - .5) * 24;
        pointerY = (event.clientY / innerHeight - .5) * 20;
        if (pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
            scene.style.setProperty("--pointer-x", `${pointerX.toFixed(2)}px`);
            scene.style.setProperty("--pointer-y", `${pointerY.toFixed(2)}px`);
            pointerFrame = 0;
        });
    }, { passive: true });
}
updateMode();
