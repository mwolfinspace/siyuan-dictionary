const { Plugin } = require("siyuan");

module.exports = class DictionaryPlugin extends Plugin {
  onload() {
    this.addIcons(`<symbol id="iconTranslate" viewBox="0 0 24 24">
      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path>
    </symbol>
    <symbol id="iconSearch" viewBox="0 0 24 24">
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
    </symbol>
    <symbol id="iconSpeaker" viewBox="0 0 24 24">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.49 4.49 0 002.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="currentColor"/>
    </symbol>
    <symbol id="iconBook" viewBox="0 0 24 24">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h2v8l2.5-1.5L13 12V4h5v16z" fill="currentColor"/>
    </symbol>
    <symbol id="iconContentCut" viewBox="0 0 24 24">
      <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2z" fill="currentColor"/>
    </symbol>
    <symbol id="iconContentCopy" viewBox="0 0 24 24">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
    </symbol>
    <symbol id="iconContentPaste" viewBox="0 0 24 24">
      <path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z" fill="currentColor"/>
    </symbol>`);

    this._addStyles();
    this._onOpenMenuContent = this.onOpenMenuContent.bind(this);
    this.eventBus.on("open-menu-content", this._onOpenMenuContent);

    this._onMouseUp = this._onMouseUp.bind(this);
    this._onKeyDownHandler = this._onKeyDown.bind(this);
    document.addEventListener("mouseup", this._onMouseUp);
    document.addEventListener("keydown", this._onKeyDownHandler);

    this.toolbarEl = null;
    this.panelEl = null;
    this.selectedText = "";
  }

  onunload() {
    this.eventBus.off("open-menu-content", this._onOpenMenuContent);
    document.removeEventListener("mouseup", this._onMouseUp);
    document.removeEventListener("keydown", this._onKeyDownHandler);
    this._removeToolbar();
    this._removePanel();
  }

  _addStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .dict-mark-menu {
        position: fixed;
        z-index: 950;
        display: flex;
        gap: 4px;
        padding: 6px;
        background: var(--b3-theme-surface, #fff);
        border: 1px solid var(--b3-border-color, #e0e0e0);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      .dict-mark-menu button {
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        transition: all .15s;
        color: var(--b3-theme-on-surface, #202124);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .dict-mark-menu button svg {
        width: 16px;
        height: 16px;
      }
      .dict-mark-menu button:hover {
        background: var(--b3-list-hover, #f0f0f0);
        color: var(--b3-theme-primary, #1a73e8);
      }
      .dict-popup-panel {
        --sr-gap: 4px;
        --sr-line: 19px;
        position: fixed;
        z-index: 9999;
        width: 320px;
        max-width: min(320px, calc(100vw - 12px));
        pointer-events: auto;
        cursor: default;
        overflow: auto;
        box-sizing: border-box;
        padding: 8px;
        border: 1px solid var(--b3-border-color, #e0e0e0);
        border-radius: 8px;
        background: var(--b3-theme-surface, #fff);
        color: var(--b3-theme-on-surface, #202124);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      .dict-popup-panel .dict-section {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .dict-popup-panel .dict-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--b3-theme-on-surface, #202124);
        font-weight: 600;
      }
      .dict-popup-panel .dict-head button {
        width: 22px;
        height: 22px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--b3-theme-on-surface-variant, #5f6368);
      }
      .dict-popup-panel .dict-head button:hover {
        background: var(--b3-list-hover, #f0f0f0);
        color: var(--b3-theme-primary, #1a73e8);
      }
      .dict-popup-panel .dict-head button svg {
        width: 14px;
        height: 14px;
      }
      .dict-popup-panel .dict-body {
        font-size: 14px;
        line-height: 1.6;
        overflow-y: auto;
        color: var(--b3-theme-on-surface, #202124);
        padding: 8px;
        background: var(--b3-theme-background, #f8f9fa);
        border-radius: 4px;
        border: 1px solid var(--b3-border-color, #e0e0e0);
        max-height: 200px;
      }
      .dict-popup-panel .dict-divider {
        height: 1px;
        background: var(--b3-border-color, #e0e0e0);
        margin: 8px 0;
      }
      .dict-popup-panel .dict-src {
        max-height: 50px;
      }
      .dict-popup-panel .dict-loading {
        color: var(--b3-theme-on-surface-variant, #5f6368);
        font-size: 12px;
        padding: 8px;
      }
      .dict-popup-panel .dict-word {
        font-size: 18px;
        font-weight: 700;
        color: var(--b3-theme-on-surface, #202124);
        margin-bottom: 4px;
      }
      .dict-popup-panel .dict-phonetic {
        font-size: 12px;
        color: var(--b3-theme-on-surface-variant, #5f6368);
        margin-bottom: 8px;
      }
      .dict-popup-panel .dict-pos {
        font-size: 11px;
        font-weight: 600;
        color: var(--b3-theme-primary, #1a73e8);
        margin-top: 6px;
      }
      .dict-popup-panel .dict-def {
        font-size: 13px;
        margin: 2px 0 2px 12px;
        color: var(--b3-theme-on-surface, #202124);
      }
      .dict-popup-panel .dict-example {
        font-size: 12px;
        color: var(--b3-theme-on-surface-variant, #5f6368);
        margin-left: 12px;
        font-style: italic;
      }
      .dict-popup-panel .dict-tts-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 0;
      }
      .dict-popup-panel .dict-tts-bar button {
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--b3-border-color, #e0e0e0);
        background: var(--b3-theme-background, #f8f9fa);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--b3-theme-on-surface, #202124);
        transition: all .15s;
      }
      .dict-popup-panel .dict-tts-bar button:hover {
        background: var(--b3-list-hover, #f0f0f0);
        color: var(--b3-theme-primary, #1a73e8);
      }
      .dict-popup-panel .dict-tts-bar button svg {
        width: 14px;
        height: 14px;
      }
      .dict-popup-panel .dict-tts-bar .dict-tts-status {
        font-size: 11px;
        color: var(--b3-theme-on-surface-variant, #5f6368);
      }
    `;
    document.head.appendChild(style);
  }

  _onKeyDown(e) {
    if (this.toolbarEl || this.panelEl) {
      this._removeToolbar();
      this._removePanel();
    }
  }

  _onMouseUp(e) {
    setTimeout(() => {
      if (e.button === 2) {
        this._removeToolbar();
        return;
      }
      if (e.target && e.target.closest(".dict-mark-menu, .dict-popup-panel")) {
        return;
      }
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : "";
      if (!text || text.length < 2) {
        this._removeToolbar();
        return;
      }
      if (sel.rangeCount === 0) {
        this._removeToolbar();
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      this.selectedText = text;
      this._showToolbar(rect, text);
    }, 10);
  }

  _removeToolbar() {
    if (this.toolbarEl) {
      this.toolbarEl.remove();
      this.toolbarEl = null;
    }
  }

  _removePanel() {
    if (this.panelEl) {
      this.panelEl.remove();
      this.panelEl = null;
    }
  }

  _showToolbar(rect, text) {
    this._removeToolbar();
    this._removePanel();

    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      this._savedRange = sel.getRangeAt(0).cloneRange();
    } else {
      this._savedRange = null;
    }

    const toolbar = document.createElement("div");
    toolbar.className = "dict-mark-menu";

    const buttons = [
      { icon: "iconContentCut", title: "Cut", action: () => { this._execCut(text); this._removeToolbar(); } },
      { icon: "iconContentCopy", title: "Copy", action: () => { this._execCopy(text); this._removeToolbar(); } },
      { icon: "iconContentPaste", title: "Paste", action: () => { this._execPaste(); this._removeToolbar(); } },
      { icon: "iconSearch", title: "Search Google", action: () => { this._searchGoogle(text); this._removeToolbar(); } },
      { icon: "iconSpeaker", title: "Read Aloud", action: () => { this._showTtsPanel(text); this._removeToolbar(); } },
      { icon: "iconBook", title: "Dictionary", action: () => { this._showDictPanel(text); this._removeToolbar(); } },
      { icon: "iconTranslate", title: "Translate", action: () => { this._showTranslatePanel(text); this._removeToolbar(); } },
    ];

    for (const btn of buttons) {
      const el = document.createElement("button");
      el.title = btn.title;
      el.innerHTML = `<svg><use xlink:href="#${btn.icon}"></use></svg>`;
      el.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
      el.addEventListener("click", (e) => { e.stopPropagation(); btn.action(); });
      toolbar.appendChild(el);
    }

    document.body.appendChild(toolbar);

    const tr = toolbar.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tr.width / 2;
    let top = rect.top - tr.height - 6;

    if (top < 0) {
      top = rect.bottom + 6;
    }
    left = Math.max(4, Math.min(left, window.innerWidth - tr.width - 4));

    toolbar.style.left = left + "px";
    toolbar.style.top = top + "px";
    this.toolbarEl = toolbar;
  }

  _showPanelAt(rect, contentEl) {
    this._removePanel();
    const panel = document.createElement("div");
    panel.className = "dict-popup-panel";
    panel.appendChild(contentEl);
    document.body.appendChild(panel);

    const pr = panel.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - pr.width / 2;
    let top = rect.bottom + 6;

    if (top + pr.height > window.innerHeight - 4) {
      top = rect.top - pr.height - 6;
    }
    left = Math.max(4, Math.min(left, window.innerWidth - pr.width - 4));
    if (top < 4) top = 4;

    panel.style.left = left + "px";
    panel.style.top = top + "px";
    this.panelEl = panel;
  }

  _makePanelHead(titleText) {
    const head = document.createElement("div");
    head.className = "dict-head";

    const title = document.createElement("span");
    title.textContent = titleText;
    head.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>`;
    closeBtn.addEventListener("click", (e) => { e.stopPropagation(); this._removePanel(); });
    head.appendChild(closeBtn);

    return head;
  }

  async _execCut(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    this._restoreRange();
    document.execCommand("delete");
  }

  async _execCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  }

  async _execPaste() {
    let clipboardText = "";
    try {
      clipboardText = await navigator.clipboard.readText();
    } catch {
      return;
    }
    if (clipboardText) {
      this._restoreRange();
      document.execCommand("insertText", false, clipboardText);
    }
  }

  _restoreRange() {
    if (!this._savedRange) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(this._savedRange);
  }

  _searchGoogle(text) {
    window.open("https://www.google.com/search?q=" + encodeURIComponent(text), "_blank");
  }

  _showTtsPanel(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const container = document.createElement("div");
    container.className = "dict-section";

    container.appendChild(this._makePanelHead("Read Aloud"));

    const body = document.createElement("div");
    body.className = "dict-body";
    body.textContent = text;
    body.style.maxHeight = "80px";
    container.appendChild(body);

    container.appendChild(this._makeDivider());

    const bar = document.createElement("div");
    bar.className = "dict-tts-bar";

    const playBtn = document.createElement("button");
    playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>`;
    playBtn.title = "Play";

    const pauseBtn = document.createElement("button");
    pauseBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg>`;
    pauseBtn.title = "Pause";

    const stopBtn = document.createElement("button");
    stopBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 6h12v12H6z" fill="currentColor"/></svg>`;
    stopBtn.title = "Stop";

    const status = document.createElement("span");
    status.className = "dict-tts-status";
    status.textContent = "Ready";

    let utterance = null;

    playBtn.addEventListener("click", () => {
      window.speechSynthesis.cancel();
      utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.onstart = () => { status.textContent = "Speaking..."; };
      utterance.onend = () => { status.textContent = "Done"; };
      utterance.onerror = () => { status.textContent = "Error"; };
      window.speechSynthesis.speak(utterance);
    });

    pauseBtn.addEventListener("click", () => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        status.textContent = "Paused";
      } else if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        status.textContent = "Speaking...";
      }
    });

    stopBtn.addEventListener("click", () => {
      window.speechSynthesis.cancel();
      status.textContent = "Stopped";
    });

    bar.appendChild(playBtn);
    bar.appendChild(pauseBtn);
    bar.appendChild(stopBtn);
    bar.appendChild(status);
    container.appendChild(bar);

    this._showPanelAt(document.getSelection().getRangeAt(0).getBoundingClientRect(), container);
  }

  async _showDictPanel(text) {
    const word = text.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "").toLowerCase();
    const container = document.createElement("div");
    container.className = "dict-section";

    container.appendChild(this._makePanelHead("Dictionary"));

    const body = document.createElement("div");
    body.className = "dict-body";
    body.innerHTML = '<div class="dict-loading">Looking up...</div>';
    container.appendChild(body);

    const sr = document.getSelection().rangeCount ? document.getSelection().getRangeAt(0).getBoundingClientRect() : { left: 100, top: 100, width: 0, height: 0 };
    this._showPanelAt(sr, container);

    if (!word) {
      body.innerHTML = '<div class="dict-loading">No valid word found</div>';
      return;
    }

    try {
      const resp = await fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word));
      if (!resp.ok) throw new Error("Not found");
      const data = await resp.json();
      const entry = data[0];

      let html = `<div class="dict-word">${entry.word}</div>`;
      if (entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text)) {
        html += `<div class="dict-phonetic">${entry.phonetic || entry.phonetics[0].text}</div>`;
      }

      for (const meaning of entry.meanings || []) {
        html += `<div class="dict-pos">${meaning.partOfSpeech}</div>`;
        for (const def of meaning.definitions || []) {
          html += `<div class="dict-def">- ${def.definition}</div>`;
          if (def.example) {
            html += `<div class="dict-example">"${def.example}"</div>`;
          }
        }
      }

      body.innerHTML = html;
    } catch (e) {
      body.innerHTML = '<div class="dict-loading">No definition found</div>';
    }
  }

  async _showTranslatePanel(text) {
    const container = document.createElement("div");
    container.className = "dict-section";

    container.appendChild(this._makePanelHead("Translate to Vietnamese"));

    const srcSection = document.createElement("div");
    srcSection.className = "dict-section";
    const srcHead = document.createElement("div");
    srcHead.className = "dict-head";
    srcHead.textContent = "Source";
    srcSection.appendChild(srcHead);

    const srcText = document.createElement("div");
    srcText.className = "dict-body dict-src";
    srcText.textContent = text;
    srcSection.appendChild(srcText);
    container.appendChild(srcSection);

    container.appendChild(this._makeDivider());

    const tgtSection = document.createElement("div");
    tgtSection.className = "dict-section";
    const tgtHead = document.createElement("div");
    tgtHead.className = "dict-head";
    tgtHead.textContent = "Target";
    tgtSection.appendChild(tgtHead);

    const tgtText = document.createElement("div");
    tgtText.className = "dict-body";
    tgtText.innerHTML = '<div class="dict-loading">Translating...</div>';
    tgtSection.appendChild(tgtText);
    container.appendChild(tgtSection);

    const sr = document.getSelection().rangeCount ? document.getSelection().getRangeAt(0).getBoundingClientRect() : { left: 100, top: 100, width: 0, height: 0 };
    this._showPanelAt(sr, container);

    try {
      const translation = await this.translate(text);
      tgtText.textContent = translation;
    } catch (e) {
      tgtText.innerHTML = '<div class="dict-loading">Translation failed. Check network.</div>';
    }
  }

  _makeDivider() {
    const div = document.createElement("div");
    div.className = "dict-divider";
    return div;
  }

  onOpenMenuContent(event) {
    const range = event.detail.range;
    if (!range) return;

    const text = range.toString().trim();
    if (!text) return;

    const url = "https://translate.google.com/?sl=auto&tl=vi&text=" + encodeURIComponent(text) + "&op=translate";
    const self = this;

    const item = {
      icon: "iconTranslate",
      label: "Đang dịch...",
      click: function () { window.open(url, "_blank"); },
      bind: function (el) {
        const labelEl = el.querySelector(".b3-menu__label");
        if (!labelEl) return;

        self.translate(text).then(function (translation) {
          labelEl.textContent = translation;
          if (translation.length > 30) {
            labelEl.style.whiteSpace = "normal";
            labelEl.style.wordBreak = "break-word";
            labelEl.style.maxWidth = "380px";
            labelEl.style.lineHeight = "1.4";
          }
        }).catch(function () {
          labelEl.textContent = "⚠️ Không có kết nối mạng";
        });
      }
    };

    event.detail.menu.addItem(item);
  }

  async translate(text) {
    var resp = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=" + encodeURIComponent(text));
    var data = await resp.json();
    var parts = [];
    for (var i = 0; i < data[0].length; i++) {
      if (data[0][i] && data[0][i][0]) parts.push(data[0][i][0]);
    }
    return parts.join("");
  }
};
