import { useState } from "react";
import { clearToken, getToken, setToken } from "../../shared/auth/tokenStore.js";

export function TokenPanel() {
  const [tokenInput, setTokenInput] = useState(getToken() || "");
  const [tokenMeta, setTokenMeta] = useState(
    getToken() ? `Token saved (${getToken().length} chars).` : "No token saved."
  );

  function saveTokenValue() {
    const value = tokenInput.trim();
    if (!value) {
      setTokenMeta("Enter a token before saving.");
      return;
    }
    setToken(value);
    setTokenMeta(`Token saved (${value.length} chars).`);
  }

  function clearTokenValue() {
    clearToken();
    setTokenInput("");
    setTokenMeta("No token saved.");
  }

  return (
    <div className="card token-card">
      <h2>API Access</h2>
      <p>Paste JWT from identity login. Stored only in browser local storage.</p>
      <div className="token-row">
        <input
          type="text"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Bearer token (without 'Bearer ')"
        />
        <button onClick={saveTokenValue}>Save Token</button>
        <button className="ghost" onClick={clearTokenValue}>
          Clear
        </button>
      </div>
      <small>{tokenMeta}</small>
    </div>
  );
}
