document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;
    const themeBtn = document.getElementById("themeToggle");

    // Apply saved theme
    const savedTheme = localStorage.getItem("theme") || "dark";

    if (savedTheme === "light") {
        body.classList.add("light-mode");
    }

    if (themeBtn) {

        themeBtn.innerHTML =
            body.classList.contains("light-mode")
            ? "☀️"
            : "🌙";

        themeBtn.addEventListener("click", () => {

            body.classList.toggle("light-mode");

            const isLight =
                body.classList.contains("light-mode");

            localStorage.setItem(
                "theme",
                isLight ? "light" : "dark"
            );

            themeBtn.innerHTML =
                isLight ? "☀️" : "🌙";

        });

    }

});