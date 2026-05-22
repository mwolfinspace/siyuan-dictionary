const { Plugin } = require("siyuan");

module.exports = class DictionaryPlugin extends Plugin {
  onload() {
    this.addIcons(`<symbol id="iconTranslate" viewBox="0 0 24 24">
      <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path>
    </symbol>`);

    this._onOpenMenuContent = this.onOpenMenuContent.bind(this);
    this.eventBus.on("open-menu-content", this._onOpenMenuContent);
  }

  onunload() {
    this.eventBus.off("open-menu-content", this._onOpenMenuContent);
  }

  async onOpenMenuContent(event) {
    const range = event.detail.range;
    if (!range) return;

    const text = range.toString().trim();
    if (!text) return;

    const url = "https://translate.google.com/?sl=auto&tl=vi&text=" + encodeURIComponent(text) + "&op=translate";

    let translation;
    try {
      translation = await this.translate(text);
    } catch (e) {
      event.detail.menu.addItem({ icon: "iconClose", label: "⚠️ Không có kết nối mạng", click: function () {} });
      return;
    }

    const item = { icon: "iconTranslate", label: translation, click: function () { window.open(url, "_blank"); } };
    if (translation.length > 30) {
      item.bind = function (el) {
        var label = el.querySelector(".b3-menu__label");
        if (label) {
          label.style.whiteSpace = "normal";
          label.style.wordBreak = "break-word";
          label.style.maxWidth = "380px";
          label.style.lineHeight = "1.4";
        }
      };
    }
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
