const ipBtn = document.getElementById("ipBtn");
const statusEl = document.getElementById("status");

function setStatus(msg = "", type = "info") {
  statusEl.textContent = msg;
  statusEl.dataset.type = type;
}

async function fetchIPv4() {
  setStatus("");
  ipBtn.disabled = true;
  ipBtn.textContent = "Fetching...";

  try {
    // ipify returns plain text by default; force IPv4
    const res = await fetch("https://api.ipify.org?format=text", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const ip = (await res.text()).trim();

    // Basic IPv4 validation
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
      throw new Error("Unexpected response");
    }

    ipBtn.textContent = ip;
    ipBtn.disabled = false;
    ipBtn.dataset.ip = ip;
    setStatus("Click the IP to copy.", "info");
  } catch (e) {
    ipBtn.textContent = "Retry";
    ipBtn.disabled = false;
    ipBtn.dataset.ip = "";
    setStatus("Failed to fetch IP. Click Retry.", "error");
  }
}

async function copyToClipboard(text) {
  // Clipboard API usually works fine in extension popups
  await navigator.clipboard.writeText(text);
}

ipBtn.addEventListener("click", async () => {
  const ip = ipBtn.dataset.ip;

  // If we don't have an IP yet, treat click as retry
  if (!ip) {
    fetchIPv4();
    return;
  }

  try {
    await copyToClipboard(ip);
    setStatus("Copied ✅", "ok");
  } catch {
    // Fallback for rare cases
    try {
      const ta = document.createElement("textarea");
      ta.value = ip;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setStatus("Copied ✅", "ok");
    } catch {
      setStatus("Copy failed. Please copy manually.", "error");
    }
  }
});

// Load immediately when popup opens
fetchIPv4();
