import os, time, hashlib, json, requests

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
DEFAULT_TIMEOUT = float(os.getenv("OPENAI_HTTP_TIMEOUT", "18"))

class TTLCache:
    def __init__(self, ttl_secs=300, max_items=512):
        self.ttl = ttl_secs
        self.max = max_items
        self._store = {}

    def get(self, key):
        item = self._store.get(key)
        if not item:
            return None
        val, ts = item
        if time.time() - ts > self.ttl:
            self._store.pop(key, None)
            return None
        return val

    def set(self, key, val):
        if len(self._store) >= self.max:
            self._store.pop(next(iter(self._store)))
        self._store[key] = (val, time.time())

CACHE = TTLCache()

def _hash_key(model: str, payload: dict) -> str:
    h = hashlib.sha256()
    h.update(model.encode())
    h.update(json.dumps(payload, sort_keys=True).encode())
    return h.hexdigest()

def call_openai(
    model: str,
    messages: list[dict],
    *,
    max_tokens: int = 512,
    temperature: float = 0.2,
    response_format: dict | None = None,
    timeout: float = DEFAULT_TIMEOUT,
):
    """
    messages: [{"role":"user"|"system"|"assistant", "content":"..."}]
    If you need strict JSON back, pass response_format={"type": "json_object"}.
    """
    if not OPENAI_API_KEY:
        return None, "OpenAI API key not configured"

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if response_format is not None:
        payload["response_format"] = response_format

    key = _hash_key(model, payload)
    cached = CACHE.get(key)
    if cached:
        return cached, None

    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=timeout)
        if resp.status_code != 200:
            return None, resp.text
        data = resp.json()
        text = (data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")) or ""
        if text:
            CACHE.set(key, text)
        return text, None
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"
