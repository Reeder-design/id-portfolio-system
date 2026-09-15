from __future__ import annotations

from flask import Flask, request


PRIVATE_RESPONSE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}


def register_security_headers(app: Flask) -> None:
    """Add conservative browser-side protections to the local-only manager.

    Portfolio Manager deliberately runs over plain HTTP on loopback, so HSTS and
    Secure cookies are not appropriate here. Non-static responses are marked
    no-store because they may contain private notes, AI material, local diffs,
    source previews, or other workspace state that should not linger in caches.
    """

    @app.after_request
    def apply_security_headers(response):
        for name, value in PRIVATE_RESPONSE_HEADERS.items():
            response.headers.setdefault(name, value)

        if request.endpoint != "static":
            response.headers["Cache-Control"] = "no-store, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"

        return response
