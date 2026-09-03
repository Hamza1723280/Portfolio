const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn) {
    menuBtn.addEventListener("click", function () {
        navLinks.classList.toggle("open");
    });
}

document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener("click", function () {
        navLinks.classList.remove("open");
    });
});

const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        formNote.textContent = "Thanks! Please message me on WhatsApp for a faster reply.";
        contactForm.reset();
    });
}