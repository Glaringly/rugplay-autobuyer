# ⚡ RugPlay Universal AutoBuyer

A Tampermonkey userscript that automatically buys **any coin** on [RugPlay.com](https://rugplay.com) at maximum speed — even when you're on a different tab or website.

> RugPlay is a **fake crypto simulator**, no real money is involved.

---

## ✨ Features

- 🪙 **Any coin** — type in any coin symbol, it works universally
- ⚡ **Max speed** — buys as fast as the server responds (0ms delay)
- 🌐 **Background buying** — keeps running via Service Worker even when you navigate away
- 💾 **Persistent settings** — coin, amount, and stats survive page refreshes
- 🔍 **Auto-detects coin** — automatically fills in the coin when you're on a coin page
- ▶/⏹ **Start/Stop anytime** — full control from the floating panel
- 🖱️ **Draggable panel** — move the HUD anywhere on screen
- 📊 **Live stats** — total buys and total spent tracked in real time
- ↺ **Reset stats** — clear counters whenever you want

---

## 📦 Installation

### Step 1 — Install Tampermonkey
Get the Tampermonkey extension for your browser:
- [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

### Step 2 — Install the Script

**Option A — One-click install (recommended):**
Click the raw file link:
👉 [`rugplay-autobuyer.user.js`](https://raw.githubusercontent.com/YOUR_USERNAME/rugplay-autobuyer/main/rugplay-autobuyer.user.js)

Tampermonkey will automatically detect it and show an install prompt. Click **Install**.

**Option B — Manual:**
1. Open Tampermonkey → **Create new script**
2. Delete all default code
3. Paste the contents of `rugplay-autobuyer.user.js`
4. Press **Ctrl+S** to save

---

## 🚀 How to Use

1. Go to **[rugplay.com](https://rugplay.com)** and **sign in**
2. The ⚡ AutoBuyer panel appears in the **bottom-right corner**
3. Type your coin symbol (e.g. `GOFUNDME`, `BTC`, `DOGE`)
   - Or just navigate to the coin's page — it auto-fills!
4. Set your **buy amount** in dollars (e.g. `1`)
5. Click **▶ START BUYING**
6. Watch the buys rack up in real time 📈

To stop, click **⏹ STOP** at any time.

> **Tip:** You can minimize the panel with the `−` button. A small ⚡ icon stays on screen so you can reopen it.

---

## 🌐 Background Mode

The script registers a **Service Worker** on `rugplay.com` so buying continues even when:
- You switch to another tab
- You navigate to a different page on rugplay.com
- Your screen is off (as long as the browser is open)

The Service Worker will stop if you:
- Click the **⏹ STOP** button
- Close the browser entirely

Next time you open rugplay.com, it will **auto-resume** if it was running before.

---

## ⚙️ Settings

| Setting | Description |
|---|---|
| **Coin** | Any valid RugPlay coin symbol (auto-uppercased) |
| **Amount** | Dollar amount per buy (decimals supported, e.g. `0.50`) |

All settings are saved automatically and persist across sessions.

---

## 📋 Compatibility

| Browser | Supported |
|---|---|
| Chrome | ✅ |
| Firefox | ✅ |
| Edge | ✅ |
| Brave | ✅ |
| Safari | ⚠️ Tampermonkey support varies |

---

## ❓ FAQ

**Q: It says "Not logged in"**
A: Make sure you're signed in to rugplay.com before starting the buyer.

**Q: It says "Insufficient funds"**
A: Your RugPlay balance is too low. The script will keep retrying automatically once you have funds.

**Q: The Service Worker didn't register**
A: Some browsers/extensions block blob-URL service workers. The script automatically falls back to an in-tab loop that still works great.

**Q: How do I fully uninstall?**
A: Disable or delete the script in Tampermonkey. To also remove the Service Worker, open Chrome DevTools → Application → Service Workers → Unregister.

---

## ⚠️ Disclaimer

This script is for use on **RugPlay.com only**, which is a fake/simulated crypto game with no real money. Automated trading may violate RugPlay's Terms of Service — use at your own risk. The author is not responsible for any account consequences.

---

## 📄 License

MIT — free to use, modify, and share.
