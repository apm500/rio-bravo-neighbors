(function () {
  const menu = document.querySelector("[data-menu]");
  const panel = document.querySelector("[data-mobile]");
  if (menu && panel) {
    menu.addEventListener("click", function () {
      panel.classList.toggle("open");
      menu.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });
  }

  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  const homes = document.querySelector("#homes");
  const each = document.querySelector("#each");
  const homesOut = document.querySelector("#homesOut");
  const eachOut = document.querySelector("#eachOut");
  const totalOut = document.querySelector("#totalOut");
  const vsOut = document.querySelector("#vsOut");
  function renderMath() {
    if (!homes || !each || !totalOut) return;
    const h = Number(homes.value);
    const e = Number(each.value);
    const t = h * e;
    const vs = t / 4900000;
    if (homesOut) homesOut.textContent = String(h);
    if (eachOut) eachOut.textContent = money(e);
    totalOut.textContent = money(t);
    if (vsOut) {
      vsOut.textContent =
        vs >= 1
          ? vs.toFixed(2) + "× the 2022 asking price of $4.9 million."
          : Math.round(vs * 100) + "% of the 2022 asking price — raise the group or the average.";
    }
  }
  if (homes && each) {
    homes.addEventListener("input", renderMath);
    each.addEventListener("input", renderMath);
    renderMath();
  }

  const homeValue = document.querySelector("#homeValue");
  const homeOut = document.querySelector("#homeOut");
  const drop17 = document.querySelector("#drop17");
  const drop25 = document.querySelector("#drop25");
  function renderLoss() {
    if (!homeValue) return;
    const v = Number(homeValue.value);
    if (homeOut) homeOut.textContent = money(v);
    if (drop17) drop17.textContent = money(Math.round(v * 0.17));
    if (drop25) drop25.textContent = money(Math.round(v * 0.25));
  }
  if (homeValue) {
    homeValue.addEventListener("input", renderLoss);
    renderLoss();
  }

  const shareBtn = document.querySelector("[data-share]");
  if (shareBtn) {
    shareBtn.addEventListener("click", async function () {
      const url = "https://www.saveriobravo.com";
      try {
        if (navigator.share) {
          await navigator.share({
            title: "Save Rio Bravo",
            text: "The golf course is going dark. Neighbors are organizing to buy 328 acres at Rio Bravo Country Club. Pledge at saveriobravo.com — send on Signal, not email.",
            url: url,
          });
          return;
        }
      } catch (_) { /* fall through */ }
      try {
        await navigator.clipboard.writeText(url);
        shareBtn.textContent = "Link copied";
        setTimeout(function () { shareBtn.textContent = "Copy the link"; }, 2200);
      } catch (_) {
        window.prompt("Copy this link", url);
      }
    });
  }

  const form = document.querySelector("#pledgeForm");
  if (form) {
    const pills = form.querySelectorAll("[data-capital]");
    const capital = form.querySelector("#capital");
    pills.forEach(function (btn) {
      btn.addEventListener("click", function () {
        pills.forEach(function (b) { b.classList.remove("on"); });
        btn.classList.add("on");
        if (capital) capital.value = btn.getAttribute("data-capital");
      });
    });

    function composePledge(data, roleLabel) {
      return [
        "Save Rio Bravo — neighbor pledge",
        "",
        "Name: " + (data.get("name") || ""),
        "Signal: " + (data.get("signal") || "(not given)"),
        "Street: " + (data.get("address") || "(not given)"),
        "I am: " + roleLabel,
        "Conditional capital pledge (not a payment): $" + Number(data.get("capital") || 0).toLocaleString("en-US"),
        "",
        "How I can help:",
        data.get("help") || "(none)",
        "",
        "Sent from Save Rio Bravo — saveriobravo.com",
      ].join("\n");
    }

    async function sendOnSignal(text) {
      try {
        if (navigator.share) {
          await navigator.share({ title: "Save Rio Bravo pledge", text: text });
          return "shared";
        }
      } catch (err) {
        if (err && err.name === "AbortError") return "cancel";
      }
      try {
        await navigator.clipboard.writeText(text);
        return "copied";
      } catch (_) {
        return "fail";
      }
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        if (c === "&") return "&" + "amp;";
        if (c === "<") return "&" + "lt;";
        if (c === ">") return "&" + "gt;";
        if (c === '"') return "&" + "quot;";
        return "&#39;";
      });
    }

    function renderDone(text, status) {
      const download = form.getAttribute("data-signal-download") || "https://signal.org/download/";
      const chat = form.getAttribute("data-signal-chat") || "";
      const openHref = chat || download;
      const openLabel = chat ? "Open Signal chat" : "Get Signal";
      form.innerHTML =
        '<p class="kicker">Nothing left this phone except through Signal</p>' +
        "<h3>Send the pledge in Signal.</h3>" +
        '<p class="muted" data-status>' + escapeHtml(status) + "</p>" +
        '<textarea class="pledge-msg" readonly>' + escapeHtml(text) + "</textarea>" +
        '<div class="send-row">' +
        '<button class="btn btn-primary" type="button" data-resend>Send on Signal</button>' +
        '<button class="btn btn-outline" type="button" data-copy>Copy pledge</button>' +
        '<a class="btn btn-outline" href="' + openHref + '" target="_blank" rel="noreferrer">' + openLabel + "</a>" +
        "</div>" +
        '<p class="muted" style="margin-top:1rem;font-size:0.8rem">This site does not upload your street or dollar figure. Signal is end-to-end encrypted. Do not fall back to email.</p>';
      form.removeAttribute("id");
      const box = form.querySelector("[data-status]");
      form.querySelector("[data-resend]").addEventListener("click", async function () {
        const r = await sendOnSignal(text);
        box.textContent =
          r === "shared" ? "Share sheet opened. Choose Signal." :
          r === "copied" ? "Copied again. Paste it in Signal." :
          "Select the text above and copy it.";
      });
      form.querySelector("[data-copy]").addEventListener("click", async function () {
        try {
          await navigator.clipboard.writeText(text);
          box.textContent = "Copied. Open Signal and paste.";
        } catch (_) {
          box.textContent = "Select the text above and copy it.";
        }
      });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const role = form.querySelector('input[name="role"]:checked');
      const roleLabel = role ? role.parentNode.textContent.trim() : "";
      const text = composePledge(data, roleLabel);
      try {
        localStorage.setItem("srb-pledge", JSON.stringify({
          name: data.get("name"),
          signal: data.get("signal"),
          capital: data.get("capital"),
          at: Date.now(),
        }));
      } catch (_) { /* ignore */ }
      const result = await sendOnSignal(text);
      const status =
        result === "shared"
          ? "Pick Signal from the share sheet — not Messages, not Mail."
          : result === "copied"
            ? "Pledge copied. Open Signal and paste it into a chat with organizers."
            : "Copy the pledge below, then paste it into Signal.";
      renderDone(text, status);
    });
  }
})();
