"use strict";

/* ========================================
   ELEMENTOS
======================================== */

const menuButton = document.getElementById("menu-toggle");
const menuPanel = document.getElementById("menu-panel");
const header = document.querySelector(".header");

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const backgroundElements = [
    document.querySelector("main"),
    document.querySelector("footer"),
    document.querySelector(".desktop-nav"),
    document.querySelector(".header .logo"),
    document.querySelector(".skip-link")
].filter(Boolean);

let menuOpen = false;
let menuAnimation = null;
let linkAnimations = [];

/* ========================================
   MENU
======================================== */

function cancelMenuAnimations() {
    if (menuAnimation) {
        menuAnimation.cancel();
        menuAnimation = null;
    }

    linkAnimations.forEach((animation) => {
        animation.cancel();
    });

    linkAnimations = [];
}

function setBackgroundInert(inert) {
    backgroundElements.forEach((element) => {
        element.inert = inert;
    });
}

function setMenu(open) {
    if (!menuButton || !menuPanel || open === menuOpen) {
        return;
    }

    cancelMenuAnimations();

    menuOpen = open;

    menuButton.setAttribute("aria-expanded", String(open));

    menuButton.setAttribute(
        "aria-label",
        open ? "Fechar menu" : "Abrir menu"
    );

    document.body.classList.toggle("menu-open", open);

    if (open) {
        openMenu();
    } else {
        closeMenu();
    }
}

function openMenu() {
    menuPanel.hidden = false;
    menuPanel.inert = false;

    /*
       O foco sai do conteúdo antes de esse
       conteúdo ficar inativo.
    */

    const firstLink = menuPanel.querySelector(".menu-links a");

    if (firstLink) {
        firstLink.focus({ preventScroll: true });
    }

    setBackgroundInert(true);

    if (
        reducedMotion.matches ||
        typeof menuPanel.animate !== "function"
    ) {
        return;
    }

    menuAnimation = menuPanel.animate(
        [
            {
                opacity: 0,
                transform: "translateY(-16px)"
            },
            {
                opacity: 1,
                transform: "translateY(0)"
            }
        ],
        {
            duration: 340,
            easing: "cubic-bezier(.2, .8, .2, 1)"
        }
    );

    menuPanel.querySelectorAll(".menu-links a").forEach(
        (link, index) => {
            const animation = link.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(24px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 450,
                    delay: 60 + index * 45,
                    fill: "backwards",
                    easing: "cubic-bezier(.2, .8, .2, 1)"
                }
            );

            linkAnimations.push(animation);
        }
    );
}

function closeMenu() {
    setBackgroundInert(false);

    menuButton.focus({ preventScroll: true });
    menuPanel.inert = true;

    if (
        reducedMotion.matches ||
        typeof menuPanel.animate !== "function"
    ) {
        finishClosingMenu();
        return;
    }

    menuAnimation = menuPanel.animate(
        [
            {
                opacity: 1,
                transform: "translateY(0)"
            },
            {
                opacity: 0,
                transform: "translateY(-12px)"
            }
        ],
        {
            duration: 190,
            easing: "ease-in"
        }
    );

    menuAnimation.finished
        .then(() => {
            if (!menuOpen) {
                finishClosingMenu();
            }
        })
        .catch(() => {
            /*
               É normal cancelar esta animação
               quando o menu volta a abrir.
            */
        });
}

function finishClosingMenu() {
    menuPanel.hidden = true;
    menuPanel.inert = false;
}

if (menuButton && menuPanel) {
    menuButton.addEventListener("click", () => {
        setMenu(!menuOpen);
    });

    menuPanel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || !href.startsWith("#")) {
                setMenu(false);
                return;
            }

            const target = document.getElementById(
                href.substring(1)
            );

            if (!target) {
                setMenu(false);
                return;
            }

            event.preventDefault();
            setMenu(false);

            /*
               Atualiza o endereço sem provocar
               um salto imediato da página.
            */

            try {
                history.pushState(null, "", href);
            } catch {
                // A navegação continua mesmo em ficheiros locais.
            }

            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });

            target.scrollIntoView({
                behavior: reducedMotion.matches ? "auto" : "smooth",
                block: "start"
            });

            target.addEventListener(
                "blur",
                () => {
                    target.removeAttribute("tabindex");
                },
                { once: true }
            );
        });
    });
}

/* ========================================
   TECLADO NO MENU
======================================== */

document.addEventListener("keydown", (event) => {
    if (!menuOpen || !menuPanel || !menuButton) {
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        setMenu(false);
        return;
    }

    if (event.key !== "Tab") {
        return;
    }

    const focusable = [
        menuButton,
        ...menuPanel.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex="0"]'
        )
    ];

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (
        event.shiftKey &&
        document.activeElement === first
    ) {
        event.preventDefault();
        last.focus();
    } else if (
        !event.shiftKey &&
        document.activeElement === last
    ) {
        event.preventDefault();
        first.focus();
    } else if (
        !focusable.includes(document.activeElement)
    ) {
        event.preventDefault();
        first.focus();
    }
});

/* ========================================
   HEADER AO FAZER SCROLL
======================================== */

let scrollQueued = false;

function updateHeader() {
    if (header) {
        header.classList.toggle(
            "scrolled",
            window.scrollY > 24
        );
    }

    scrollQueued = false;
}

window.addEventListener(
    "scroll",
    () => {
        if (!scrollQueued) {
            scrollQueued = true;
            requestAnimationFrame(updateHeader);
        }
    },
    { passive: true }
);

updateHeader();

/* ========================================
   ANIMAÇÕES DE ENTRADA
======================================== */

const revealElements = document.querySelectorAll(".reveal");

let revealObserver = null;

if (
    "IntersectionObserver" in window &&
    !reducedMotion.matches
) {
    revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            });
        },
        {
            threshold: 0.06
        }
    );

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });

    document.documentElement.classList.add("motion");
}

/* ========================================
   SECÇÃO ATIVA NO MENU DESKTOP
======================================== */

const desktopLinks = [
    ...document.querySelectorAll(".desktop-nav a")
];

if (
    "IntersectionObserver" in window &&
    desktopLinks.length > 0
) {
    const activeSections = new Map();

    function updateActiveLink() {
        const visibleSections = [...activeSections.values()];

        visibleSections.sort((first, second) => {
            return first.boundingClientRect.top -
                second.boundingClientRect.top;
        });

        const currentSection = visibleSections[0];

        desktopLinks.forEach((link) => {
            const active = Boolean(
                currentSection &&
                link.hash === `#${currentSection.target.id}`
            );

            link.classList.toggle("active", active);

            if (active) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    activeSections.set(entry.target.id, entry);
                } else {
                    activeSections.delete(entry.target.id);
                }
            });

            updateActiveLink();
        },
        {
            rootMargin: "-15% 0px -55% 0px",
            threshold: 0
        }
    );

    document.querySelectorAll("main section[id]").forEach(
        (section) => {
            sectionObserver.observe(section);
        }
    );
}

/* ========================================
   PERGUNTAS FREQUENTES
======================================== */

const questions = document.querySelectorAll(".faq details");

questions.forEach((detail) => {
    detail.addEventListener("toggle", () => {
        if (!detail.open) {
            return;
        }

        questions.forEach((other) => {
            if (other !== detail) {
                other.open = false;
            }
        });

        const answer = detail.querySelector(".faq-answer");

        if (
            answer &&
            !reducedMotion.matches &&
            typeof answer.animate === "function"
        ) {
            answer.animate(
                [
                    {
                        opacity: 0,
                        transform: "translateY(-6px)"
                    },
                    {
                        opacity: 1,
                        transform: "translateY(0)"
                    }
                ],
                {
                    duration: 250,
                    easing: "ease-out"
                }
            );
        }
    });
});

/* ========================================
   COPIAR EMAIL
======================================== */

const copyButton = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");

if (copyButton && copyStatus) {
    copyButton.addEventListener("click", async () => {
        const email = "miguel.visualss@gmail.com";

        try {
            if (!navigator.clipboard) {
                throw new Error("Clipboard indisponível.");
            }

            await navigator.clipboard.writeText(email);

            copyStatus.textContent = "Email copiado!";
        } catch {
            copyStatus.textContent =
                `Copia este endereço: ${email}`;
        }
    });
}

/* ========================================
   IMAGENS EM FALTA
======================================== */

document.querySelectorAll("img").forEach((image) => {
    function hideBrokenImage() {
        image.hidden = true;
    }

    image.addEventListener("error", hideBrokenImage);

    if (image.complete && image.naturalWidth === 0) {
        hideBrokenImage();
    }
});

/* ========================================
   PREFERÊNCIA DE MOVIMENTO REDUZIDO
======================================== */

reducedMotion.addEventListener("change", (event) => {
    if (!event.matches) {
        return;
    }

    document.documentElement.classList.remove("motion");

    revealElements.forEach((element) => {
        element.classList.add("visible");
    });

    if (revealObserver) {
        revealObserver.disconnect();
    }

    cancelMenuAnimations();

    if (menuPanel && !menuOpen) {
        finishClosingMenu();
    }
});

/* ========================================
   ANO DO FOOTER
======================================== */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}

// Remove as setas do site, mantendo apenas a do botão da home.

document.querySelectorAll("a").forEach((link) => {
    if (link.matches(".hero-copy .button")) {
        return;
    }

    const walker = document.createTreeWalker(
        link,
        NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
        node.textContent = node.textContent
            .replace(/[↗↘↑↓→←]/gu, "");
    }
});