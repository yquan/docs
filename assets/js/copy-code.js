(function () {
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function codeBlockHost(pre) {
    return (
      pre.closest(".highlighter-rouge, figure.highlight, div.highlight") || pre
    );
  }

  function attachCopyButton(pre) {
    if (!pre || pre.closest("pre") !== pre) return;

    var host = codeBlockHost(pre);
    if (host.getAttribute("data-copy-attached") === "true") return;
    host.setAttribute("data-copy-attached", "true");

    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative";
    }
    if (host === pre) {
      pre.classList.add("code-block-copy");
    }

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-code-button";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    host.appendChild(btn);

    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = (code || pre).innerText.replace(/\n$/, "");
      copyText(text).then(
        function () {
          btn.textContent = "Copied!";
          btn.classList.add("copy-code-button--success");
          setTimeout(function () {
            btn.textContent = "Copy";
            btn.classList.remove("copy-code-button--success");
          }, 2000);
        },
        function () {
          btn.textContent = "Failed";
          setTimeout(function () {
            btn.textContent = "Copy";
          }, 2000);
        }
      );
    });
  }

  document.querySelectorAll("pre").forEach(attachCopyButton);
})();
