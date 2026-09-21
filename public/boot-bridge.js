(function () {
  try {
    var html = document.documentElement;
    var path = location.pathname || "/";
    var isHome = path === "/" || path === "";
    var seen = sessionStorage.getItem("xerv-here") === "1";
    var fromNav = sessionStorage.getItem("xerv-nav") === "1";

    if (fromNav) {
      html.classList.add("is-nav-enter");
    }

    if (isHome && !seen && !fromNav) {
      html.classList.add("is-booting");

      if (!document.getElementById("boot-spin-style")) {
        var spinStyle = document.createElement("style");
        spinStyle.id = "boot-spin-style";
        spinStyle.textContent =
          "@keyframes boot-x-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}" +
          "html.is-booting .boot-x:not(.is-live){animation:boot-x-spin 1.44s cubic-bezier(0.65,0,0.35,1) 2 both}";
        (document.head || html).appendChild(spinStyle);
      }

      if (!document.getElementById("boot")) {
        var boot = document.createElement("div");
        boot.id = "boot";
        boot.className = "boot";
        boot.setAttribute("aria-hidden", "true");
        boot.innerHTML =
          '<div class="boot-bg">' +
          '<span class="boot-wash"></span>' +
          '<span class="boot-glow"></span>' +
          "</div>" +
          '<svg class="boot-x" viewBox="0 0 565.288 563.584" fill="none" aria-hidden="true">' +
          "<g>" +
          '<path d="M421.673 563.042H520.004C544.715 563.042 564.746 543.008 564.746 518.304V421.384C564.746 397.066 545.352 377.304 521.184 376.662L520.03 376.647L421.651 376.58C396.35 376.58 375.847 356.06 375.847 330.757V235.338C375.847 210.002 396.367 189.515 421.673 189.515H520.004C544.715 189.515 564.746 169.48 564.746 144.743V45.2814C564.746 20.5769 544.715 0.542171 520.004 0.542114H421.673C396.966 0.542247 376.932 20.577 376.932 45.2814V144.743C376.932 170.079 356.415 190.599 331.105 190.599H233.482C208.172 190.599 187.652 170.079 187.652 144.743V45.2814C187.652 20.5769 167.621 0.542114 142.91 0.542114H46.3168C22.1155 0.542114 2.37396 19.7684 1.59707 43.8107L1.57461 44.9591L0.867576 144.453C0.690426 169.286 20.7723 189.515 45.6088 189.515H142.91C168.219 189.515 188.737 210.002 188.737 235.338V330.855C188.737 355.559 208.771 375.593 233.482 375.593H331.105C356.415 375.593 376.932 396.113 376.932 421.417V518.304C376.932 543.008 396.966 563.042 421.673 563.042Z" fill="url(#xervGlassA)"/>' +
          '<path d="M45.2842 562.944H142.907C167.618 562.944 187.649 542.91 187.649 518.173V421.418C187.649 396.712 167.618 376.677 142.907 376.677H45.2842C20.5733 376.678 0.542 396.712 0.542 421.418V518.173C0.542102 542.91 20.5736 562.944 45.2842 562.944Z" fill="url(#xervGlassB)"/>' +
          "</g>" +
          "<defs>" +
          '<linearGradient id="xervGlassA" x1="282.806" y1="563.584" x2="282.806" y2="0" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#7A55FF"/>' +
          '<stop offset="0.5" stop-color="#5B2FF4"/>' +
          '<stop offset="1" stop-color="#A905D6"/>' +
          "</linearGradient>" +
          '<linearGradient id="xervGlassB" x1="71.5" y1="563" x2="71.5" y2="376" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#5B2FF4"/>' +
          '<stop offset="1" stop-color="#A905D6"/>' +
          "</linearGradient>" +
          "</defs>" +
          "</svg>";
        // Outside React's <body> tree — avoids hydration mismatches.
        html.appendChild(boot);
      }
    } else {
      html.classList.add("is-revealed");
    }

    var raw = sessionStorage.getItem("xerv-bridge");
    if (raw) {
      var data = JSON.parse(raw);
      if (data && data.src) {
        html.classList.add("is-bridging");
        var layer = document.createElement("div");
        layer.id = "bridge-layer";
        layer.className = "bridge-layer";
        layer.style.backgroundImage = 'url("' + data.src + '")';
        layer.style.backgroundPosition = data.pos || "center 28%";
        layer.style.backgroundSize = "cover";
        layer.style.transformOrigin = "0 0";
        if (data.box) {
          layer.style.top = data.box.top + "px";
          layer.style.left = data.box.left + "px";
          layer.style.width = data.box.width + "px";
          layer.style.height = data.box.height + "px";
          layer.style.borderRadius = data.box.radius || "0px";
        }
        html.appendChild(layer);
      }
    }
  } catch (e) {}
})();
