document.addEventListener("DOMContentLoaded", () => {
    let highestZIndex = 10;
    const bootScreen = document.getElementById("boot-screen");
    const startButton = document.getElementById("start-button");
    const runningAppsContainer = document.getElementById("running-apps");
    const countdownClock = document.getElementById("countdown-clock");

    // Boot Loader Timer
    setTimeout(() => {
        bootScreen.style.opacity = "0";
        setTimeout(() => { bootScreen.style.display = "none"; }, 500);
    }, 1500);

    // Countdown Clock Loop
    let currentMinutes = 12, currentSeconds = 0;
    setInterval(() => {
        if (currentMinutes === 0 && currentSeconds === 0) {
            setTimeout(() => { currentMinutes = 12; currentSeconds = 0; }, 500);
            return;
        }
        if (currentSeconds === 0) { currentMinutes--; currentSeconds = 59; } 
        else { currentSeconds--; }
        countdownClock.textContent = `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
    }, 1000);

    // Dynamic Taskbar Tab Creator
    function updateTaskbarTabs() {
        runningAppsContainer.innerHTML = ""; 
        document.querySelectorAll(".xp-window").forEach(win => {
            if (win.style.display !== "none") {
                const titleText = win.querySelector(".xp-window-title span").textContent;
                const tab = document.createElement("div");
                tab.className = "taskbar-tab";
                if (win.classList.contains("active-focus") && !win.classList.contains("minimized")) {
                    tab.classList.add("active-tab");
                }
                tab.textContent = titleText;
                
                // Clicking the tab minimizes or restores the window
                tab.addEventListener("click", () => {
                    if (win.classList.contains("minimized")) {
                        win.style.display = "flex";
                        win.classList.remove("minimized");
                        bringToFront(win);
                    } else if (win.classList.contains("active-focus")) {
                        win.style.display = "none";
                        win.classList.add("minimized");
                    } else {
                        bringToFront(win);
                    }
                    updateTaskbarTabs();
                });
                runningAppsContainer.appendChild(tab);
            }
        });
    }

    function bringToFront(winElement) {
        document.querySelectorAll(".xp-window").forEach(w => w.classList.remove("active-focus"));
        highestZIndex++;
        winElement.style.zIndex = highestZIndex;
        winElement.classList.add("active-focus");
        if (winElement.classList.contains("minimized")) {
            winElement.style.display = "flex";
            winElement.classList.remove("minimized");
        }
    }

    // Window Control Behaviors
    document.querySelectorAll(".xp-window").forEach(win => {
        win.addEventListener("mousedown", () => {
            bringToFront(win);
            updateTaskbarTabs();
        });

        // Close Button
        win.querySelector(".btn-close").addEventListener("click", (e) => {
            e.stopPropagation();
            win.style.display = "none";
            win.classList.remove("fullscreen", "minimized");
            updateTaskbarTabs();
        });

        // Minimize Button
        win.querySelector(".btn-min").addEventListener("click", (e) => {
            e.stopPropagation();
            win.style.display = "none";
            win.classList.add("minimized");
            updateTaskbarTabs();
        });

        // Fullscreen / Maximize Button
        win.querySelector(".btn-max").addEventListener("click", (e) => {
            e.stopPropagation();
            win.classList.toggle("fullscreen");
            bringToFront(win);
        });

        setupWindowDrag(win, win.querySelector(".xp-window-header"));
    });

    // Desktop Icon Triggers
    document.querySelectorAll("[data-window]").forEach(trigger => {
        trigger.addEventListener("click", () => {
            const targetWin = document.getElementById(trigger.getAttribute("data-window"));
            if (targetWin) {
                targetWin.style.display = "flex";
                targetWin.classList.remove("minimized");
                bringToFront(targetWin);
                updateTaskbarTabs();
            }
        });
    });

    // Drag System Execution
    function setupWindowDrag(windowEl, headerEl) {
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
        headerEl.onmousedown = (e) => {
            if (windowEl.classList.contains("fullscreen")) return; // Block dragging if fullscreen
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
            document.onmousemove = (ev) => {
                ev.preventDefault();
                posX = mouseX - ev.clientX;
                posY = mouseY - ev.clientY;
                mouseX = ev.clientX;
                mouseY = ev.clientY;
                windowEl.style.top = (windowEl.offsetTop - posY) + "px";
                windowEl.style.left = (windowEl.offsetLeft - posX) + "px";
            };
            bringToFront(windowEl);
            updateTaskbarTabs();
        };
    }
});