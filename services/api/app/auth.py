import base64
import hashlib
import hmac
import json
import os
import time
from uuid import uuid4


AUTH_SECRET = os.getenv('WARATTEL_AUTH_SECRET', 'change-me-in-production').encode()


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=16384, r=8, p=1)
    return f'{salt.hex()}${digest.hex()}'


def verify_password(password: str, stored_hash: str) -> bool:
    salt_hex, digest_hex = stored_hash.split('$', 1)
    digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=16384, r=8, p=1)
    return hmac.compare_digest(digest.hex(), digest_hex)


def create_token(user_id: str) -> str:
    header = _encode({'alg': 'HS256', 'typ': 'JWT'})
    payload = _encode({'sub': user_id, 'exp': int(time.time()) + 60 * 60 * 24 * 30})
    signature = _sign(f'{header}.{payload}')
    return f'{header}.{payload}.{signature}'


def decode_token(token: str) -> str | None:
    try:
        header, payload, signature = token.split('.')
        if not hmac.compare_digest(_sign(f'{header}.{payload}'), signature):
            return None
        data = json.loads(_decode(payload))
        if data['exp'] < time.time():
            return None
        return data['sub']
    except (KeyError, ValueError, TypeError, json.JSONDecodeError):
        return None


def new_user_id() -> str:
    return str(uuid4())


def _encode(value: dict[str, object]) -> str:
    return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).decode().rstrip('=')


def _decode(value: str) -> str:
    return base64.urlsafe_b64decode(f'{value}===').decode()


def _sign(value: str) -> str:
    return base64.urlsafe_b64encode(hmac.new(AUTH_SECRET, value.encode(), hashlib.sha256).digest()).decode().rstrip('=')