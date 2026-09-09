const header = document.getElementById("header");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

window.addEventListener("scroll", function () {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 12);
});

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () {
        const open = navLinks.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("open");
            menuBtn.setAttribute("aria-expanded", "false");
        });
    });
}

const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
const sendBtn = document.getElementById("sendBtn");
const MAILBOX = "hamzadha12@gmail.com";

function encodeFields(fields) {
    return Object.keys(fields)
        .map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(fields[key]);
        })
        .join("&");
}

function postJson(url, payload) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify(payload)
    }).then(function (res) {
        return res.json().then(function (data) {
            return { ok: res.ok && data.ok !== false, data: data };
        }).catch(function () {
            return { ok: res.ok, data: {} };
        });
    });
}

function sendViaNetlifyForms(fields) {
    return fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeFields(fields)
    }).then(function (res) {
        return { ok: res.ok, data: {} };
    });
}

if (contactForm && formNote) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (contactForm["bot-field"] && contactForm["bot-field"].value) {
            formNote.textContent = "Thanks. Your message was sent.";
            return;
        }

        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();
        const payload = {
            name: name,
            email: email,
            message: message,
            _subject: "New message from Hamza portfolio",
            _template: "table",
            _captcha: "false",
            _replyto: email
        };

        if (sendBtn) {
            sendBtn.disabled = true;
            sendBtn.textContent = "Sending…";
        }
        formNote.textContent = "Sending your message…";

        postJson("/.netlify/functions/contact", payload)
            .then(function (result) {
                if (result.ok) return result;
                return postJson("https://formsubmit.co/ajax/" + MAILBOX, payload);
            })
            .then(function (result) {
                if (result.ok) return result;
                if (window.location.hostname.indexOf("netlify") === -1) {
                    throw new Error("Send failed");
                }
                return sendViaNetlifyForms({
                    "form-name": "contact",
                    name: name,
                    email: email,
                    message: message
                });
            })
            .then(function (result) {
                if (!result.ok) {
                    throw new Error("Send failed");
                }
                contactForm.reset();
                formNote.textContent = "Message sent. I will reply to your email.";
            })
            .catch(function () {
                const subject = encodeURIComponent("Portfolio message from " + name);
                const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
                window.location.href = "mailto:" + MAILBOX + "?subject=" + subject + "&body=" + body;
                formNote.textContent = "Opening Gmail / email app so the message still reaches me.";
            })
            .finally(function () {
                if (sendBtn) {
                    sendBtn.disabled = false;
                    sendBtn.textContent = "Send message";
                }
            });
    });
}
