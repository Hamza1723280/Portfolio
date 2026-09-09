const MAILBOX = "hamzadha12@gmail.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

function json(statusCode, body) {
    return {
        statusCode,
        headers: corsHeaders,
        body: JSON.stringify(body)
    };
}

function parseBody(event) {
    const raw = event.body || "";
    const contentType = (event.headers["content-type"] || event.headers["Content-Type"] || "").toLowerCase();

    if (contentType.includes("application/json")) {
        return JSON.parse(raw || "{}");
    }

    const params = new URLSearchParams(raw);
    const data = {};
    params.forEach(function (value, key) {
        data[key] = value;
    });
    return data;
}

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return json(405, { ok: false, error: "Method not allowed" });
    }

    let data;
    try {
        data = parseBody(event);
    } catch (err) {
        return json(400, { ok: false, error: "Invalid request" });
    }

    if (data["bot-field"] || data._honey) {
        return json(200, { ok: true, skipped: true });
    }

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const message = String(data.message || "").trim();

    if (!name || !email || !message) {
        return json(400, { ok: false, error: "Name, email and message are required" });
    }

    const payload = {
        name: name,
        email: email,
        message: message,
        _replyto: email,
        _subject: "New message from Hamza portfolio",
        _template: "table",
        _captcha: "false"
    };

    try {
        const response = await fetch("https://formsubmit.co/ajax/" + MAILBOX, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json().catch(function () {
            return {};
        });

        if (!response.ok) {
            return json(502, { ok: false, error: result.message || "Email service failed" });
        }

        return json(200, { ok: true, message: "Message sent" });
    } catch (err) {
        return json(500, { ok: false, error: "Could not send message" });
    }
};
