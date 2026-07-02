"""Emergent object storage client wrapper.

Session-scoped storage_key initialized once at app startup. All uploads
are prefixed with APP_NAME so this app's objects stay isolated. See the
Emergent object storage playbook — no delete API, no presigned URLs, no
rename. We soft-delete in Mongo and always download through our own
authenticated endpoint.
"""
import os
from typing import Tuple

import requests

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"

_storage_key: str | None = None


def _app_name() -> str:
    return os.environ.get("APP_NAME", "infinitysheets")


def _emergent_key() -> str:
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY is missing from the environment")
    return key


def init_storage() -> str:
    """Initialize once at startup — the returned storage_key is session-scoped."""
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(
        f"{STORAGE_URL}/init",
        json={"emergent_key": _emergent_key()},
        timeout=30,
    )
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key


def _key_or_reinit() -> str:
    global _storage_key
    if _storage_key is None:
        return init_storage()
    return _storage_key


def build_path(user_id: str, filename: str, uid: str) -> str:
    ext = filename.split(".")[-1].lower() if "." in filename else "bin"
    return f"{_app_name()}/uploads/{user_id}/{uid}.{ext}"


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = _key_or_reinit()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 403:
        # Refresh key once and retry
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> Tuple[bytes, str]:
    key = _key_or_reinit()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 403:
        global _storage_key
        _storage_key = None
        key = init_storage()
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
