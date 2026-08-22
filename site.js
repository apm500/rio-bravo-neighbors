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
            text: "The golf course is going dark. Neighbors are organizing to buy 328 acres at Rio Bravo Country Club. Pledge at saveriobravo.com",
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
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const role = form.querySelector('input[name="role"]:checked');
      const subject = encodeURIComponent("Save Rio Bravo pledge — " + (data.get("name") || "neighbor"));
      const body = encodeURIComponent(
        [
          "Name: " + data.get("name"),
          "Email: " + data.get("email"),
          "Phone: " + (data.get("phone") || ""),
          "Address: " + (data.get("address") || ""),
          "I am: " + (role ? role.parentNode.textContent.trim() : ""),
          "Conditional capital pledge (not a payment): $" + Number(data.get("capital") || 0).toLocaleString("en-US"),
          "",
          "How I can help:",
          data.get("help") || "",
          "",
          "Sent from Save Rio Bravo — saveriobravo.com",
        ].join("\n")
      );
      window.location.href = "mailto:riobravoneighbors@gmail.com?subject=" + subject + "&body=" + body;
      form.innerHTML =
        '<p class="kicker">Pledge recorded on this device</p><h3>Now send it to the organizers.</h3><p>Your mail app should open addressed to <a href="mailto:riobravoneighbors@gmail.com">riobravoneighbors@gmail.com</a>. If it does not, tap that address and paste the same details.</p>';
    });
  }
})();
