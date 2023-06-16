'use strict'

// markdown-it plugin for generating copy code button.
// It depends on preWrapper plugin.

/* eslint-disable max-len */
module.exports = function (md) {
  // === Start: 防止复制按钮不断被创建 ===
  if (!md.renderer.rules.originalFence) {
    md.renderer.rules.originalFence = md.renderer.rules.fence
  }
  // === End: Patch ===
  const fence = md.renderer.rules.originalFence

  md.renderer.rules.fence = function () {
    const rawCode = fence.apply(void 0, arguments)
    const button = '\n    <button class="v-md-copy-code-btn" type="button">\n      <i class="nz-icon nz-icon-override"></i>\n    </button>'
    const finalCode = rawCode.replace('<!--beforeend-->', button + '<!--beforeend-->').replace('v-md-pre-wrapper', 'v-md-pre-wrapper copy-code-mode')
    return finalCode
  }
}
