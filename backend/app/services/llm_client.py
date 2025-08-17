import os, time, hashlib, json, requests

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
DEFAULT_TIMEOUT = float(os.getenv("GEMINI_HTTP_TIMEOUT", "18"))

class TTLCache:
    def __init__(self, ttl_secs=300, max_items=512):
        self.ttl = ttl_secs
        self.max = max_items
        self._store = {}

    def get(self, key):
        item = self._store.get(key)
        if not item: return None
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

def call_gemini(model: str, parts: list[dict], *,
                max_output_tokens=512, temperature=0.2,
                timeout: float = DEFAULT_TIMEOUT):
    if not GEMINI_API_KEY:
        return None, "Gemini API key not configured"

    payload = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "maxOutputTokens": max_output_tokens,
            "temperature": temperature,
        },
    }
    key = _hash_key(model, payload)
    cached = CACHE.get(key)
    if cached:
        return cached, None

    url = f"{BASE_URL}/{model}:generateContent?key={GEMINI_API_KEY}"
    try:
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=timeout)
        if resp.status_code != 200:
            return None, resp.text
        data = resp.json()
        text = (data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")) or ""
        if text:
            CACHE.set(key, text)
        return text, None
    except Exception as e:
        return None, str(e)
