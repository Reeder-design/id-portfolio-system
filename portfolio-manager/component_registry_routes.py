from __future__ import annotations

from flask import Blueprint, flash, redirect, render_template, url_for

from component_registry_service import ComponentRegistryError, registry_with_usage


component_registry_bp = Blueprint(
    "component_registry",
    __name__,
    url_prefix="/component-registry",
)


@component_registry_bp.get("/")
def workspace():
    try:
        components = registry_with_usage()
    except ComponentRegistryError as exc:
        flash(str(exc), "error")
        return redirect(url_for("dashboard"))

    counts = {
        "total": len(components),
        "template_supported": sum(1 for item in components if item.get("support") == "template-supported"),
        "custom_pattern": sum(1 for item in components if item.get("support") == "custom-pattern"),
        "used": sum(1 for item in components if item.get("usage_count")),
    }
    return render_template(
        "component-registry.html",
        components=components,
        counts=counts,
    )
