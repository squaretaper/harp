#!/usr/bin/env python3
"""Validate the public HARP v0.1 protocol distribution."""

from __future__ import annotations

import hashlib
import json
import math
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
PROTOCOL = ROOT / "protocol" / "harp" / "v0.1"
SCHEMA_DIR = PROTOCOL / "schema"
FIXTURE_DIR = PROTOCOL / "fixtures"
MAX_ENVELOPE_BYTES = 1_048_576

SCHEMA_FILES = {
    "section": "section.schema.json",
    "move": "move.schema.json",
    "dispatch": "dispatch.schema.json",
    "event": "event.schema.json",
    "receipt": "receipt.schema.json",
}

VALID_FIXTURES = (
    ("section", "valid-section.json"),
    ("section", "valid-retracted-section.json"),
    ("move", "valid-move.json"),
    ("dispatch", "valid-dispatch.json"),
    ("event", "valid-event.json"),
    ("event", "valid-event-retract-section.json"),
    ("receipt", "valid-receipt.json"),
)

SCHEMA_NEGATIVE_FIXTURES = (
    ("invalid-audience.json", "origin_workspace_id"),
    ("invalid-uuid-case-alias.json", "does not match"),
    ("invalid-leap-second.json", "does not match"),
)

SEMANTIC_NEGATIVE_FIXTURES = (
    ("invalid-author-acceptance.json", "author state must be accepted"),
    ("invalid-acceptance-actor.json", "actor_principal_id must belong to the pair"),
    ("invalid-acceptance-projection.json", "replayed acceptance event state and version"),
    ("invalid-submillisecond-order.json", "must not be later than acceptance.as_of"),
    ("invalid-nanosecond-replay.json", "latest replayed transition time"),
    ("invalid-post-retraction-transition.json", "no events may follow section_retracted"),
)

LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
TIMESTAMP_RE = re.compile(
    r"^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})"
    r"(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$"
)


class DuplicateKeyError(ValueError):
    """Raised when JSON contains duplicate object member names."""


class NonFiniteNumberError(ValueError):
    """Raised for JavaScript/Python numeric extensions that are not JSON."""


def reject_duplicate_keys(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateKeyError(f"duplicate JSON member: {key!r}")
        result[key] = value
    return result


def reject_nonfinite_constant(value: str) -> None:
    raise NonFiniteNumberError(f"non-standard JSON numeric constant: {value}")


def require_finite_numbers(value: Any, location: str = "$") -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise NonFiniteNumberError(f"non-finite number at {location}")
    if isinstance(value, dict):
        for key, nested in value.items():
            require_finite_numbers(nested, f"{location}.{key}")
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            require_finite_numbers(nested, f"{location}[{index}]")


def parse_json(text: str) -> Any:
    value = json.loads(
        text,
        object_pairs_hook=reject_duplicate_keys,
        parse_constant=reject_nonfinite_constant,
    )
    require_finite_numbers(value)
    return value


def load_json(path: Path) -> Any:
    return parse_json(path.read_text(encoding="utf-8"))


def timestamp(value: str) -> int:
    """Return exact nanoseconds since the Unix epoch for the HARP profile."""
    match = TIMESTAMP_RE.fullmatch(value)
    if match is None:
        raise ValueError("invalid HARP timestamp")
    year, month, day, hour, minute, second = (int(part) for part in match.groups()[:6])
    fraction_ns = int((match.group(7) or "").ljust(9, "0") or "0")

    adjusted_year = year - (1 if month <= 2 else 0)
    era = adjusted_year // 400
    year_of_era = adjusted_year - era * 400
    adjusted_month = month + (-3 if month > 2 else 9)
    day_of_year = (153 * adjusted_month + 2) // 5 + day - 1
    day_of_era = year_of_era * 365 + year_of_era // 4 - year_of_era // 100 + day_of_year
    days_since_epoch = era * 146097 + day_of_era - 719468
    epoch_seconds = days_since_epoch * 86400 + hour * 3600 + minute * 60 + second

    zone = match.group(8)
    if zone != "Z":
        direction = 1 if zone[0] == "+" else -1
        offset_minutes = int(zone[1:3]) * 60 + int(zone[4:6])
        epoch_seconds -= direction * offset_minutes * 60
    return epoch_seconds * 1_000_000_000 + fraction_ns


def section_hash(section: dict[str, Any]) -> tuple[str, str]:
    content = section["content"].replace("\r\n", "\n").replace("\r", "\n")
    content = unicodedata.normalize("NFC", content)
    hash_input = {
        "content": content,
        "evidence_refs": section["evidence_refs"],
        "protocol_version": section["protocol_version"],
        "section_type": section["section_type"],
    }
    # This input domain contains strings and arrays of strings only. Python's
    # sorted, compact, UTF-8 JSON serialization therefore matches RFC 8785 JCS.
    canonical = json.dumps(
        hash_input,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    )
    digest = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return canonical, f"sha256-jcs-nfc-v1:{digest}"


def validate_section_semantics(section: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    pair = section["pair_principal_ids"]
    author = section["author_principal_id"]

    if pair[0] >= pair[1]:
        errors.append("pair_principal_ids must contain distinct IDs in lexical order")
    if author not in pair:
        errors.append("author_principal_id must belong to the pair")

    acceptance = section["acceptance"]
    acceptance_as_of = timestamp(acceptance["as_of"])
    rows = acceptance["rows"]
    row_principals = [row["principal_id"] for row in rows]
    if len(set(row_principals)) != 2 or set(row_principals) != set(pair):
        errors.append("acceptance rows must contain each pair principal exactly once")

    author_row = next((row for row in rows if row["principal_id"] == author), None)
    if author_row is None or author_row["state"] != "accepted":
        errors.append("acceptance rows author state must be accepted")
    if any(timestamp(row["updated_at"]) > acceptance_as_of for row in rows):
        errors.append("acceptance rows updated_at must not be later than acceptance.as_of")
    if timestamp(section["created_at"]) > acceptance_as_of:
        errors.append("section created_at must not be later than acceptance.as_of")

    events = acceptance["events"]
    event_ids = [event["event_id"] for event in events]
    if len(set(event_ids)) != len(event_ids):
        errors.append("acceptance event_id values must be unique")

    replay_state: dict[str, str] = {}
    replay_version: dict[str, int] = {}
    replay_updated_at: dict[str, int] = {}
    proposal_seen = False
    replay_lifecycle_state = "active"
    replay_lifecycle_version = 1
    replay_retracted_at: int | None = None
    prior_event_time: int | None = None

    for index, event in enumerate(events):
        event_type = event["event_type"]
        actor = event["actor_principal_id"]
        event_time = timestamp(event["created_at"])
        if actor not in pair:
            errors.append("acceptance events actor_principal_id must belong to the pair")
        if event_time > acceptance_as_of:
            errors.append("acceptance events created_at must not be later than acceptance.as_of")
        if prior_event_time is not None and event_time < prior_event_time:
            errors.append("acceptance events must be ordered by created_at")
        prior_event_time = event_time
        if replay_lifecycle_state == "retracted":
            errors.append("acceptance events no events may follow section_retracted")

        if event_type == "proposed":
            if proposal_seen:
                errors.append("acceptance events must contain exactly one proposed event")
            if index != 0:
                errors.append("acceptance events proposed must be the first event")
            if actor != author:
                errors.append("acceptance events proposed actor must be the author principal")
            if (
                event["prior_state"] is not None
                or event["next_state"] is not None
                or event["state_version"] != 1
            ):
                errors.append("acceptance events proposed must initialize version 1 with null states")
            proposal_seen = True
            for principal in pair:
                replay_state[principal] = "accepted" if principal == author else "pending"
                replay_version[principal] = 1
                replay_updated_at[principal] = event_time
            continue

        if event_type == "section_retracted":
            if actor != author:
                errors.append("acceptance events section_retracted actor must be the author principal")
            if (
                replay_lifecycle_state != "active"
                or event["prior_state"] != "active"
                or event["next_state"] != "retracted"
            ):
                errors.append("acceptance events section_retracted must transition active to retracted")
            if event["state_version"] != replay_lifecycle_version + 1:
                errors.append(
                    "acceptance events section_retracted state_version must increment lifecycle version"
                )
            replay_lifecycle_state = "retracted"
            replay_lifecycle_version = event["state_version"]
            replay_retracted_at = event_time
            continue

        if not proposal_seen or actor not in replay_state:
            errors.append(f"acceptance events {event_type} requires a prior proposal for the actor")
            continue
        expected_next = {
            "accepted": "accepted",
            "rejected": "rejected",
            "acceptance_retracted": "retracted",
        }.get(event_type)
        if expected_next is None:
            continue
        current = replay_state[actor]
        current_version = replay_version[actor]
        if event["prior_state"] != current or event["next_state"] != expected_next:
            errors.append(f"acceptance events {event_type} does not continue the actor state")
        if event["state_version"] != current_version + 1:
            errors.append(f"acceptance events {event_type} state_version must increment the actor version")
        replay_state[actor] = expected_next
        replay_version[actor] = event["state_version"]
        replay_updated_at[actor] = event_time

    if not proposal_seen:
        errors.append("acceptance events must contain a proposed event")
    for row in rows:
        principal = row["principal_id"]
        if replay_state.get(principal) != row["state"] or replay_version.get(principal) != row["version"]:
            errors.append("acceptance rows must equal the replayed acceptance event state and version")
        if principal in replay_updated_at and replay_updated_at[principal] != timestamp(row["updated_at"]):
            errors.append("acceptance rows updated_at must equal the latest replayed transition time")

    lifecycle = section["lifecycle"]
    if (
        lifecycle["state"] != replay_lifecycle_state
        or lifecycle["version"] != replay_lifecycle_version
    ):
        errors.append("lifecycle state and version must equal the replayed lifecycle events")
    if replay_lifecycle_state == "retracted":
        if lifecycle["retracted_by_principal_id"] != author:
            errors.append("lifecycle retracted_by_principal_id must equal the author principal")
        if replay_retracted_at != timestamp(lifecycle["retracted_at"]):
            errors.append("lifecycle retracted_at must equal the section_retracted event time")

    _, expected_hash = section_hash(section)
    if section["content_hash"] != expected_hash:
        errors.append("content_hash does not match canonical section content")

    return errors


def schema_errors(
    validator: Draft202012Validator, instance: Any
) -> list[tuple[str, str]]:
    results: list[tuple[str, str]] = []
    for error in sorted(validator.iter_errors(instance), key=lambda item: list(item.path)):
        location = "/" + "/".join(str(part) for part in error.absolute_path)
        results.append((location, error.message))
    return results


def validate_markdown_links() -> list[str]:
    errors: list[str] = []
    for path in ROOT.rglob("*.md"):
        if any(part in {".git", ".venv"} for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        for raw_target in LINK_RE.findall(text):
            target = raw_target.strip().split(maxsplit=1)[0].strip("<>")
            if target.startswith(("http://", "https://", "mailto:", "#")):
                continue
            relative = target.split("#", 1)[0]
            if not relative:
                continue
            candidate = (path.parent / relative).resolve()
            if not candidate.exists():
                errors.append(f"{path.relative_to(ROOT)}: broken relative link {raw_target!r}")
    return errors


def main() -> int:
    errors: list[str] = []
    schemas: dict[str, Any] = {}
    validators: dict[str, Draft202012Validator] = {}
    format_checker = FormatChecker()

    for kind, filename in SCHEMA_FILES.items():
        path = SCHEMA_DIR / filename
        try:
            schema = load_json(path)
            Draft202012Validator.check_schema(schema)
            schemas[kind] = schema
            validators[kind] = Draft202012Validator(schema, format_checker=format_checker)
        except Exception as exc:  # validator must report every malformed artifact
            errors.append(f"{path.relative_to(ROOT)}: invalid schema: {exc}")

    event_schema = schemas.get("event")
    if event_schema is not None:
        try:
            variants = event_schema["oneOf"][0]["properties"]["payload"]["oneOf"]
            if variants[0]["properties"]["data"] != schemas.get("dispatch"):
                errors.append("event.schema.json bundled dispatch differs from dispatch.schema.json")
            if variants[1]["properties"]["data"] != schemas.get("move"):
                errors.append("event.schema.json bundled move differs from move.schema.json")
        except (KeyError, IndexError, TypeError) as exc:
            errors.append(f"event.schema.json bundled-schema layout is invalid: {exc}")

    for kind, filename in VALID_FIXTURES:
        path = FIXTURE_DIR / filename
        try:
            instance = load_json(path)
        except Exception as exc:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")
            continue

        encoded_size = len(path.read_bytes())
        if encoded_size > MAX_ENVELOPE_BYTES:
            errors.append(
                f"{path.relative_to(ROOT)}: {encoded_size} bytes exceeds {MAX_ENVELOPE_BYTES}"
            )

        validator = validators.get(kind)
        if validator is None:
            continue
        fixture_errors = schema_errors(validator, instance)
        for location, message in fixture_errors:
            errors.append(f"{path.relative_to(ROOT)}{location}: {message}")

        if kind == "section" and not fixture_errors:
            for error in validate_section_semantics(instance):
                errors.append(f"{path.relative_to(ROOT)}: {error}")

    section_validator = validators.get("section")
    if section_validator is not None:
        for filename, expected_error in SCHEMA_NEGATIVE_FIXTURES:
            path = FIXTURE_DIR / filename
            try:
                instance = load_json(path)
                failures = schema_errors(section_validator, instance)
                joined = " ".join(f"{location} {message}" for location, message in failures)
                if not failures:
                    errors.append(f"{path.relative_to(ROOT)} unexpectedly passed schema validation")
                elif expected_error not in joined:
                    errors.append(
                        f"{path.relative_to(ROOT)} failed for the wrong reason; "
                        f"expected {expected_error!r} in {joined!r}"
                    )
            except Exception as exc:
                errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")

        for filename, expected_error in SEMANTIC_NEGATIVE_FIXTURES:
            path = FIXTURE_DIR / filename
            try:
                instance = load_json(path)
                failures = schema_errors(section_validator, instance)
                if failures:
                    errors.append(f"{path.relative_to(ROOT)} must pass schema before semantic rejection")
                    continue
                semantic = validate_section_semantics(instance)
                joined = " ".join(semantic)
                if expected_error not in joined:
                    errors.append(
                        f"{path.relative_to(ROOT)} failed for the wrong semantic reason; "
                        f"expected {expected_error!r} in {joined!r}"
                    )
            except Exception as exc:
                errors.append(f"{path.relative_to(ROOT)}: invalid JSON: {exc}")

    earlier = timestamp("2026-07-11T18:00:00.000000001Z")
    later = timestamp("2026-07-11T18:00:00.000000002Z")
    equivalent_offset = timestamp("2026-07-11T13:00:00.000000001-05:00")
    if not earlier < later:
        errors.append("timestamp parser lost nanosecond ordering")
    if earlier != equivalent_offset:
        errors.append("timestamp parser disagrees across equivalent UTC offsets")

    for token in ("NaN", "Infinity", "-Infinity", "1e400"):
        try:
            parse_json(f'{{"value":{token}}}')
            errors.append(f"strict JSON loader unexpectedly accepted {token}")
        except NonFiniteNumberError:
            pass

    vector_path = FIXTURE_DIR / "hash-nfc-crlf.json"
    try:
        vector = load_json(vector_path)
        canonical, content_hash = section_hash(vector["input"])
        if canonical != vector["canonical_utf8"]:
            errors.append(f"{vector_path.relative_to(ROOT)}: canonical_utf8 mismatch")
        if content_hash != vector["content_hash"]:
            errors.append(f"{vector_path.relative_to(ROOT)}: content_hash mismatch")
        normalized = vector["input"]["content"].replace("\r\n", "\n").replace("\r", "\n")
        normalized = unicodedata.normalize("NFC", normalized)
        if normalized != vector["normalized_content"]:
            errors.append(f"{vector_path.relative_to(ROOT)}: normalized_content mismatch")
    except Exception as exc:
        errors.append(f"{vector_path.relative_to(ROOT)}: invalid hash vector: {exc}")

    errors.extend(validate_markdown_links())

    if errors:
        print("HARP v0.1 conformance distribution: FAILED", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    negative_count = len(SCHEMA_NEGATIVE_FIXTURES) + len(SEMANTIC_NEGATIVE_FIXTURES)
    print(
        "HARP v0.1 conformance distribution: OK "
        f"({len(schemas)} schemas, {len(VALID_FIXTURES)} valid fixtures, "
        f"{negative_count} negative fixtures)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
