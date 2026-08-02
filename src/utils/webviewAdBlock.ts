/** Provider origin is private; navigation allowlist uses embed URL origin only. */
const PLAYER_ORIGIN =
  process.env.MIMURO_PLAYER_ORIGIN ?? 'https://YOUR_PRIVATE_PLAYER.example';

const AD_URL_PATTERNS = [
  /doubleclick\.net/i,
  /googlesyndication\.com/i,
  /googleadservices\.com/i,
  /popads\.net/i,
  /popcash\.net/i,
  /adsterra/i,
  /clickadu/i,
  /mgid\.com/i,
  /exoclick/i,
  /propellerads/i,
  /revcontent/i,
  /taboola\.com/i,
  /outbrain\.com/i,
];

export function isBlockedAdUrl(url: string) {
  return AD_URL_PATTERNS.some(pattern => pattern.test(url));
}

export function getUrlOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function shouldAllowWebViewNavigation(url: string, embedUrl?: string) {
  if (!url || url === 'about:blank') {
    return true;
  }

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return true;
  }

  if (isBlockedAdUrl(url)) {
    return false;
  }

  const allowedOrigins = new Set([PLAYER_ORIGIN]);
  const embedOrigin = embedUrl ? getUrlOrigin(embedUrl) : null;

  if (embedOrigin) {
    allowedOrigins.add(embedOrigin);
  }

  const origin = getUrlOrigin(url);
  if (!origin) {
    return true;
  }

  return allowedOrigins.has(origin);
}

const POPUP_BLOCK_SCRIPT_BODY = `
(function () {
  var blocked = function () { return null; };
  window.open = blocked;
  window.showModalDialog = blocked;
})();
`;

const VIDEO_END_SCRIPT_BODY = `
(function () {
  if (window.__mimuroVideoEndHook) {
    return;
  }
  window.__mimuroVideoEndHook = true;

  function notifyEnded() {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'videoEnded' }));
    }
  }

  function attachToVideo(video) {
    if (!video || video.dataset.mimuroEndHook) {
      return;
    }
    video.dataset.mimuroEndHook = '1';

    function markEnded() {
      if (video.dataset.mimuroEnded) {
        return;
      }
      video.dataset.mimuroEnded = '1';
      notifyEnded();
    }

    video.addEventListener('ended', markEnded);

    video.addEventListener('timeupdate', function () {
      if (video.dataset.mimuroEnded || !video.duration || !isFinite(video.duration)) {
        return;
      }
      if (video.duration - video.currentTime < 0.5) {
        markEnded();
      }
    });
  }

  function scanVideos() {
    document.querySelectorAll('video').forEach(attachToVideo);
  }

  var observer = new MutationObserver(scanVideos);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  scanVideos();
})();
`;

/**
 * Route movi-player fullscreen through React Native host fullscreen so the WebView
 * actually widens in landscape (CustomView keeps clientWidth at portrait size).
 */
const HOST_FULLSCREEN_SCRIPT_BODY = `
(function () {
  if (window.__mimuroHostFullscreenHook) {
    return;
  }
  window.__mimuroHostFullscreenHook = true;
  window.__mimuroHostFullscreen = false;
  var lastMediaTapAt = 0;
  var lastMediaTapX = 0;
  var lastMediaTapY = 0;
  var ignoreMediaTapUntil = 0;

  function post(type) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type }));
      }
    } catch (e) {}
  }

  function requestHostFullscreen(wantActive) {
    var next = !!wantActive;
    var now = Date.now();
    if (window.__mimuroHostFullscreen === next) {
      return;
    }
    if (window.__mimuroFsToggleAt && now - window.__mimuroFsToggleAt < 450) {
      return;
    }
    window.__mimuroFsToggleAt = now;
    window.__mimuroHostFullscreen = next;
    // Swallow follow-up taps so 1-press doesn't re-toggle after double-tap enter.
    ignoreMediaTapUntil = now + 450;
    lastMediaTapAt = 0;
    post(next ? 'hostFullscreenEnter' : 'hostFullscreenExit');
  }

  function toggleHostFullscreen() {
    requestHostFullscreen(!window.__mimuroHostFullscreen);
  }

  function longSide() {
    return Math.max(
      (window.screen && screen.width) || 0,
      (window.screen && screen.height) || 0,
      window.innerWidth || 0,
      window.innerHeight || 0,
      1
    );
  }

  function refreshPlayerSize() {
    var active = !!window.__mimuroHostFullscreen;
    var width = active ? longSide() : 0;

    document.querySelectorAll('movi-player').forEach(function (player) {
      var w = width || player.clientWidth;
      if (w > 0) {
        player.style.setProperty('--movi-player-width', w + 'px');
      }
      try {
        if (typeof player.applySubtitleSettings === 'function') {
          player.applySubtitleSettings();
        }
      } catch (e) {}
      try {
        var current = player.getAttribute('subtitlesize');
        var settings = player._subtitleSettings;
        var mult =
          settings && typeof settings.sizeMult === 'number' ? settings.sizeMult : 1;
        var restore =
          current != null && current !== '' ? current : String(mult || 1);
        var temp = restore === '1.2' || Number(restore) === 1.2 ? '1.5' : '1.2';
        player.setAttribute('subtitlesize', String(temp));
        if (typeof player.applySubtitleSettings === 'function') {
          player.applySubtitleSettings();
        }
        setTimeout(function () {
          player.setAttribute('subtitlesize', String(restore));
          if (typeof player.applySubtitleSettings === 'function') {
            player.applySubtitleSettings();
          }
        }, 50);
      } catch (e2) {}
    });
    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e3) {}
  }

  function setHostFullscreen(active) {
    window.__mimuroHostFullscreen = !!active;
    try {
      document.documentElement.style.width = '100%';
      document.documentElement.style.height = '100%';
      document.body.style.width = '100%';
      document.body.style.height = active ? '100%' : '';
      document.body.style.margin = '0';
      document.body.style.overflow = 'hidden';
    } catch (e) {}

    document.querySelectorAll('movi-player').forEach(function (player) {
      player.style.width = '100%';
      player.style.height = active ? '100%' : '';
      player.style.maxHeight = active ? '100%' : '';
      try {
        if (typeof player.setHostFullscreen === 'function') {
          player.setHostFullscreen(!!active);
        }
      } catch (e2) {}
    });

    refreshPlayerSize();
    if (active) {
      [80, 200, 450, 900].forEach(function (delay) {
        setTimeout(refreshPlayerSize, delay);
      });
    }
  }

  window.__mimuroSetHostFullscreen = setHostFullscreen;
  window.__mimuroRefreshPlayerSize = refreshPlayerSize;

  function stopEvent(event) {
    try {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }
    } catch (e) {}
  }

  function onFullscreenRequest(event) {
    stopEvent(event);
    // detail.active = desired fullscreen state from movi-player (double-tap + button).
    if (event.detail && typeof event.detail.active === 'boolean') {
      requestHostFullscreen(!!event.detail.active);
      return;
    }
    toggleHostFullscreen();
  }

  function attrText(el) {
    return (
      (el.getAttribute &&
        (el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          el.getAttribute('data-tooltip') ||
          el.getAttribute('data-title') ||
          '')) ||
      ''
    ).toLowerCase();
  }

  function classText(el) {
    return (
      (el.className && el.className.toString
        ? el.className.toString()
        : typeof el.className === 'string'
          ? el.className
          : '') || ''
    ).toLowerCase();
  }

  // State wrappers / overlays after enter — never treat as the FS button.
  function isFullscreenStateShell(el) {
    var cls = classText(el);
    var name = (el.tagName || '').toLowerCase();
    if (
      name === 'movi-player' ||
      name === 'video' ||
      name === 'html' ||
      name === 'body'
    ) {
      return true;
    }
    if (
      /\\b(is-fullscreen|in-fullscreen|host-fullscreen|fullscreen-active|fullscreened|is-fs)\\b/.test(
        cls,
      )
    ) {
      return true;
    }
    if (
      (el.childElementCount || 0) > 2 &&
      !attrText(el) &&
      /fullscreen/.test(cls)
    ) {
      return true;
    }
    try {
      var rect = el.getBoundingClientRect && el.getBoundingClientRect();
      if (
        rect &&
        rect.width > 96 &&
        rect.height > 96 &&
        /fullscreen/.test(cls + ' ' + (el.id || ''))
      ) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Strict FS control only (loose span/control matching caused 1-tap toggle).
  function looksLikeFullscreenControl(el) {
    if (!el || el.nodeType !== 1 || isFullscreenStateShell(el)) {
      return false;
    }
    var label = attrText(el).trim();
    var cls = classText(el);
    var id = (el.id || '').toLowerCase();
    var name = (el.tagName || '').toLowerCase();
    var role = (el.getAttribute('role') || '').toLowerCase();
    var labeled = /full[\\s-]?screen/.test(label);
    var btnToken =
      /(?:^|[\\s_-])(fullscreen[_-]?btn|full[_-]?screen[_-]?btn|btn[_-]?fullscreen|fs[_-]?btn|movi-fs|enterfs|exitfs|icon-fullscreen|fullscreen-icon|fullscreen-toggle)(?:$|[\\s_-])/.test(
        cls + ' ' + id,
      );
    var classFs = /(?:^|[\\s_-])fullscreen(?:$|[\\s_-])/.test(cls + ' ' + id);
    var isButton = name === 'button' || role === 'button';
    if (!labeled && !btnToken && !(classFs && isButton)) {
      return false;
    }
    return (
      isButton ||
      name === 'svg' ||
      name === 'path' ||
      name === 'use' ||
      btnToken ||
      labeled
    );
  }

  function isPlayerChromeTarget(target) {
    var el = target && target.nodeType === 1 ? target : target && target.parentElement;
    var hops = 0;
    while (el && hops < 10) {
      var name = (el.tagName || '').toLowerCase();
      if (name === 'video' || name === 'movi-player') {
        return false;
      }
      if (looksLikeFullscreenControl(el)) {
        return true;
      }
      var hay = classText(el) + ' ' + attrText(el) + ' ' + (el.id || '').toLowerCase();
      if (
        name === 'button' ||
        el.getAttribute('role') === 'button' ||
        /\\b(control|controls|toolbar|seek|progress|timeline|volume|settings|caption|subtitle|menu)\\b/.test(
          hay,
        )
      ) {
        return true;
      }
      el = el.parentElement || (el.getRootNode && el.getRootNode().host) || null;
      hops += 1;
    }
    return false;
  }

  function handleFullscreenControlClick(event) {
    var target = event.target;
    if (!target) {
      return;
    }
    var el = target.nodeType === 1 ? target : target.parentElement;
    var hops = 0;
    while (el && hops < 8) {
      var name = (el.tagName || '').toLowerCase();
      if (name === 'movi-player' || name === 'video') {
        return;
      }
      if (looksLikeFullscreenControl(el)) {
        stopEvent(event);
        toggleHostFullscreen();
        return;
      }
      el = el.parentElement || (el.getRootNode && el.getRootNode().host) || null;
      hops += 1;
    }
  }

  // Double-tap anywhere on the media surface → same host fullscreen as FS button.
  function handleMediaDoubleTap(event) {
    var target = event.target;
    var now = Date.now();
    if (now < ignoreMediaTapUntil) {
      lastMediaTapAt = 0;
      return;
    }
    // Don't steal taps on real controls (seek, FS button, etc.).
    if (!target || isPlayerChromeTarget(target)) {
      lastMediaTapAt = 0;
      return;
    }
    var x = event.clientX || 0;
    var y = event.clientY || 0;
    if (
      now - lastMediaTapAt < 320 &&
      Math.abs(x - lastMediaTapX) < 48 &&
      Math.abs(y - lastMediaTapY) < 48
    ) {
      lastMediaTapAt = 0;
      stopEvent(event);
      toggleHostFullscreen();
      return;
    }
    lastMediaTapAt = now;
    lastMediaTapX = x;
    lastMediaTapY = y;
  }

  function attachShadowClick(root) {
    if (!root || root.__mimuroFsClick) {
      return;
    }
    root.__mimuroFsClick = true;
    root.addEventListener('click', handleFullscreenControlClick, true);
    root.addEventListener('click', handleMediaDoubleTap, true);
  }

  function attachPlayer(player) {
    if (!player || player.dataset.mimuroHostFs) {
      return;
    }
    player.dataset.mimuroHostFs = '1';
    player.addEventListener('movi-fullscreen-request', onFullscreenRequest);

    try {
      player.requestFullscreen = function () {
        requestHostFullscreen(true);
        return Promise.resolve();
      };
    } catch (e) {}
    try {
      player.webkitRequestFullscreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e2) {}
    try {
      player.webkitRequestFullScreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e3) {}
    try {
      player.exitFullscreen = function () {
        requestHostFullscreen(false);
        return Promise.resolve();
      };
    } catch (e4) {}

    try {
      if (player.shadowRoot) {
        attachShadowClick(player.shadowRoot);
      }
    } catch (e5) {}
  }

  function attachVideo(video) {
    if (!video || video.dataset.mimuroHostFsVideo) {
      return;
    }
    video.dataset.mimuroHostFsVideo = '1';
    try {
      video.webkitEnterFullscreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e) {}
    try {
      video.webkitEnterFullScreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e2) {}
    try {
      video.requestFullscreen = function () {
        requestHostFullscreen(true);
        return Promise.resolve();
      };
    } catch (e3) {}
  }

  function scan() {
    document.querySelectorAll('movi-player').forEach(attachPlayer);
    document.querySelectorAll('video').forEach(attachVideo);
    document.querySelectorAll('movi-player').forEach(function (player) {
      try {
        if (player.shadowRoot) {
          attachShadowClick(player.shadowRoot);
        }
      } catch (e) {}
    });
  }

  document.addEventListener('movi-fullscreen-request', onFullscreenRequest, true);
  document.addEventListener('click', handleFullscreenControlClick, true);
  document.addEventListener('click', handleMediaDoubleTap, true);

  if (typeof Element !== 'undefined' && Element.prototype.requestFullscreen) {
    var originalRequestFullscreen = Element.prototype.requestFullscreen;
    Element.prototype.requestFullscreen = function () {
      var isPlayer =
        this &&
        (this.tagName === 'MOVI-PLAYER' ||
          this.tagName === 'VIDEO' ||
          (this.closest && this.closest('movi-player')));
      if (isPlayer) {
        requestHostFullscreen(true);
        return Promise.resolve();
      }
      return originalRequestFullscreen.apply(this, arguments);
    };
  }

  if (typeof Element !== 'undefined' && Element.prototype.exitFullscreen) {
    var originalExitFullscreen = Element.prototype.exitFullscreen;
    Element.prototype.exitFullscreen = function () {
      if (window.__mimuroHostFullscreen) {
        requestHostFullscreen(false);
        return Promise.resolve();
      }
      return originalExitFullscreen.apply(this, arguments);
    };
  }

  if (typeof HTMLVideoElement !== 'undefined') {
    try {
      HTMLVideoElement.prototype.webkitEnterFullscreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e) {}
    try {
      HTMLVideoElement.prototype.webkitEnterFullScreen = function () {
        requestHostFullscreen(true);
      };
    } catch (e2) {}
  }

  var observer = new MutationObserver(scan);
  if (document.documentElement) {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
  scan();
  setInterval(scan, 1500);
})();
`;

export const WEBVIEW_PLAYER_INJECTED_SCRIPT = `${VIDEO_END_SCRIPT_BODY}${HOST_FULLSCREEN_SCRIPT_BODY}true;`;

/** Early patch so requestFullscreen is hooked before movi-player boots. */
export const WEBVIEW_HOST_FULLSCREEN_BEFORE_LOAD_SCRIPT = `${POPUP_BLOCK_SCRIPT_BODY}${HOST_FULLSCREEN_SCRIPT_BODY}true;`;

export function buildHostFullscreenActiveScript(active: boolean) {
  return `window.__mimuroSetHostFullscreen&&window.__mimuroSetHostFullscreen(${
    active ? 'true' : 'false'
  });true;`;
}
