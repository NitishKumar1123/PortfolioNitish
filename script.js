const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a[href^='#']")];

function setMenuOpen(isOpen) {
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  siteNav.classList.toggle("is-open", isOpen);
  siteNav.inert = !isOpen && window.matchMedia("(max-width: 760px)").matches;
  document.body.classList.toggle("menu-open", isOpen);
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const mobileNavigation = window.matchMedia("(max-width: 760px)");
mobileNavigation.addEventListener("change", (event) => {
  setMenuOpen(false);
  siteNav.inert = event.matches;
});
siteNav.inert = mobileNavigation.matches;

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const sections = document.querySelectorAll("main section[id]");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => {
          const isCurrent = link.hash === `#${entry.target.id}`;
          if (isCurrent) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-30% 0px -60% 0px" },
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    projectCards.forEach((card) => {
      card.classList.toggle("is-filtered", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

const codeforcesCard = document.querySelector("[data-codeforces-card]");
const codeforcesStreak = document.querySelector("[data-codeforces-streak]");
const codeforcesActiveDays = document.querySelector("[data-codeforces-days]");
const codeforcesStatus = document.querySelector("[data-codeforces-status]");

async function updateCodeforcesActivity() {
  try {
    const response = await fetch(
      "https://codeforces.com/api/user.status?handle=Nitish_Kumar001&from=1&count=1000",
    );
    if (!response.ok) {
      throw new Error(`Codeforces returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "OK" || !Array.isArray(data.result)) {
      throw new Error(data.comment || "Codeforces returned an invalid activity response");
    }

    const activityDays = new Set(
      data.result.map((submission) => Math.floor(submission.creationTimeSeconds / 86400)),
    );
    codeforcesActiveDays.textContent = String(activityDays.size);

    if (activityDays.size === 0) {
      codeforcesStreak.textContent = "—";
      codeforcesStatus.textContent = "No public submissions are available for this handle yet.";
      return;
    }

    let activeDay = Math.floor(Date.now() / 86400000);
    if (!activityDays.has(activeDay) && activityDays.has(activeDay - 1)) {
      activeDay -= 1;
    }

    let currentStreak = 0;
    while (activityDays.has(activeDay)) {
      currentStreak += 1;
      activeDay -= 1;
    }

    codeforcesStreak.textContent = String(currentStreak);
    codeforcesStatus.textContent = "Calculated from public submission days (UTC) in the latest 1,000 submissions.";
  } catch (error) {
    console.error("Could not load Codeforces activity:", error);
    codeforcesStreak.textContent = "—";
    codeforcesActiveDays.textContent = "—";
    codeforcesStatus.textContent = "Live activity couldn’t be loaded. Open the Codeforces profile to check it.";
    codeforcesCard.dataset.activityState = "unavailable";
  }
}

updateCodeforcesActivity();

const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.classList.remove("is-error");
  formStatus.textContent = "Sending your message…";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      formStatus.classList.add("is-error");
      formStatus.textContent = "Your message couldn’t be sent. Please email nitish23129@iiitd.ac.in instead.";
      return;
    }

    contactForm.reset();
    formStatus.textContent = "Thanks for reaching out — your message has been sent.";
  } catch (error) {
    console.error("Contact form submission failed:", error);
    formStatus.classList.add("is-error");
    formStatus.textContent = "Your message couldn’t be sent. Please email nitish23129@iiitd.ac.in instead.";
  }
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
