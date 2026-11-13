// Runs before styles paint; the appearance preference only affects DOM chrome.
(() => {
    const key = "orb-foundry.appearance";
    const system = matchMedia("(prefers-color-scheme: dark)");
    let preference = null;
    try { preference = localStorage.getItem(key); } catch { /* Storage is optional. */ }
    function apply(value) {
        const theme = ["light", "dark"].includes(value) ? value : system.matches ? "dark" : "light";
        document.documentElement.dataset.appearance = theme;
        document.documentElement.style.colorScheme = theme;
        for (const button of document.querySelectorAll("[data-theme-toggle]")) {
            const next = theme === "dark" ? "light" : "dark";
            button.setAttribute("aria-label", `Switch to ${next} mode`);
            button.setAttribute("aria-pressed", String(theme === "dark"));
            button.title = `Switch to ${next} mode`;
            const label = button.querySelector("[data-theme-label]");
            if (label) label.textContent = next === "dark" ? "Dark mode" : "Light mode";
            button.dataset.themeIcon = theme === "dark" ? "sun" : "moon";
        }
        document.dispatchEvent(new CustomEvent("orb-theme-change", { detail: { theme } }));
    }
    apply(preference);
    document.addEventListener("DOMContentLoaded", () => {
        apply(preference);
        for (const button of document.querySelectorAll("[data-theme-toggle]")) button.addEventListener("click", () => {
            preference = document.documentElement.dataset.appearance === "dark" ? "light" : "dark";
            try { localStorage.setItem(key, preference); } catch { /* The toggle still works. */ }
            apply(preference);
        });
    });
    system.addEventListener("change", () => { if (!preference) apply(null); });
    window.addEventListener("storage", (event) => { if (event.key === key) { preference = event.newValue; apply(preference); } });
})();
