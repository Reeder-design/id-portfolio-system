#!/usr/bin/env python3
"""Regression checks for deterministic Ask Haley routing policy."""

from __future__ import annotations

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "portfolio-manager"))

from hiring_guide_public_sync import _has_supported_question_match, _score_question_match, _tokens  # noqa: E402


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def main() -> int:
    errors: list[str] = []
    controller = (ROOT / "portfolio" / "js" / "hiring-manager.js").read_text(encoding="utf-8")
    policy = ROOT / "portfolio" / "data" / "hiring-routing-policy.json"
    public_sync = (ROOT / "portfolio-manager" / "hiring_guide_public_sync.py").read_text(encoding="utf-8")

    require(policy.exists(), "Missing shared Hiring Manager routing policy.", errors)
    for marker in [
        "const routeQuestion =", "const inputBoundary =", "const boundaryNow =",
        "PROFESSIONAL_BOUNDARY_PATTERN", "min_search_score", "answerNow(route.matches[0].question",
        "BROWSE_ROUTES", "browseNow", "typo_aliases", "fieldHasToken",
    ]:
        require(marker in controller, f"Hiring Manager controller is missing routing guardrail {marker!r}.", errors)
    for marker in ["PUBLIC_ROUTING_POLICY_PATH", "_score_question_match", "_has_supported_question_match"]:
        require(marker in public_sync, f"Hiring Guide simulator is missing shared routing behavior {marker!r}.", errors)

    technical = {
        "prompt": "How do you design technical training for a non-technical sales audience?",
        "short_label": "Technical training for sales",
        "category": "Instructional Design",
        "keywords": ["technical training", "sales audience", "technical content"],
        "variants": ["How do you simplify technical material for sellers?"],
    }
    supported = _score_question_match("How do you simplify technical material for sellers?", technical)
    unsupported = _score_question_match("What's your favorite thing about California?", technical)
    filler = _score_question_match("the", technical)
    greeting = _score_question_match("hi", technical)
    performance_support = {
        "prompt": "What performance support experience do you have for a training launch?",
        "short_label": "Performance support experience",
        "category": "Instructional Design",
        "keywords": ["performance support", "job aid", "point of need"],
        "variants": ["How do you decide between training and performance support?"],
    }
    typo_supported = _score_question_match("performance suport training expreince", performance_support)
    require(_has_supported_question_match(supported), "A supported paraphrase did not route to its question.", errors)
    require(not _has_supported_question_match(unsupported), "An unrelated question routed from incidental language.", errors)
    require(not _has_supported_question_match(filler), "A filler word routed to a Hiring Guide answer.", errors)
    require(not _has_supported_question_match(greeting), "A greeting routed to a Hiring Guide answer.", errors)
    require(_has_supported_question_match(typo_supported), "A common high-value term typo did not route to its intended question.", errors)
    require(_tokens("performance suport training expreince")[:2] == ["performance", "support"], "Typo aliases did not normalize important routing terms.", errors)

    if errors:
        print("Hiring Guide routing validation failed:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print("Hiring Guide routing validation passed: supported questions route precisely and unrelated prompts do not route from generic language.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
