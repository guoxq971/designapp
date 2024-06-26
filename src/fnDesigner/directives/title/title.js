import { bindInit } from './titleUtil';

/**
 * 样式组装函数
 * @param {*} obj 样式对象
 * @returns {string} style样式的字符串
 */
const fn = (obj) => Object.keys(obj).reduce((pre, cur) => `${pre};${cur}:${obj[cur]};`, '');

// 箭头和目标元素的距离
const diffTarget = 6;

// 盒子样式
const titleWrapStyle = {
  position: 'fixed',
  background: 'rgb(48, 49, 51)',
  color: 'rgb(255, 255, 255)',
  'border-radius': '4px',
  padding: '10px',
  'z-index': '4000',
  'font-size': '12px',
  'line-height': '1.2',
  'min-width': '10px',
  'overflow-wrap': 'break-word',
};
// 箭头样式
const arrowWrapStyle = {
  position: ' absolute',
  'z-index': '4000',
  left: '50%',
  transform: 'translateX(-50%)',
  'border-top': ' 14px solid rgb(48, 49, 51)',
  'border-left': ' 10px solid transparent',
  'border-right': ' 10px solid transparent',
};
const titleWrapStyleStr = fn(titleWrapStyle);
const arrowWrapStyleStr = fn(arrowWrapStyle);

/**
 * 显示标题
 * @param {*} el 元素el
 * @param {*} title 标题
 */
function showTitle(el, title) {
  const popover = getPopover();
  const popoverStyle = popover.style;

  if (title === undefined) {
    popoverStyle.display = 'none';
  } else {
    const elRect = el.getBoundingClientRect();
    const elComputedStyle = window.getComputedStyle(el, null);
    const rightOffset = parseInt(elComputedStyle.getPropertyValue('padding-right')) || 0;
    const topOffset = parseInt(elComputedStyle.getPropertyValue('padding-top')) || 0;
    const topOffset2 = el.classList.value.split(' ').find((e) => e === 'el-button') ? parseInt(elComputedStyle.getPropertyValue('margin-top')) || 0 : 0;

    popoverStyle.visibility = 'hidden';
    popoverStyle.display = 'block';
    popover.querySelector('.popover-content').textContent = title;
    popoverStyle.left = elRect.left - popover.offsetWidth / 2 + (el.offsetWidth - rightOffset) / 2 + 'px';
    popoverStyle.top = elRect.top - popover.offsetHeight + topOffset - topOffset2 - diffTarget + 'px';
    popoverStyle.display = 'block';
    popoverStyle.visibility = 'visible';
  }
}

/**
 * 创建元素添加到body
 */
function getPopover() {
  let popover = document.querySelector('.title-popover');

  if (!popover) {
    const tpl = `
        <div class="popover title-popover top fade in" style="${titleWrapStyleStr}">
            <div class="popover-content"></div>
            <span class="arrow" style="${arrowWrapStyleStr}"></span>
        </div>
      `;
    const fragment = document.createRange().createContextualFragment(tpl);
    document.body.appendChild(fragment);
    popover = document.querySelector('.title-popover');
  }

  return popover;
}

export default {
  bind(el, binding, vnode) {
    const { init } = bindInit(el, binding, showTitle);
    init();
  },
  update(el, binding) {
    const { value, oldValue } = binding;
    if (value !== oldValue) {
      const { init, destroy } = bindInit(el, binding, showTitle);
      destroy();

      init();
    }
  },
  unbind(el) {
    // 移除事件监听和数据绑定
    el.destroy();
    const popover = document.querySelector('.title-popover');
    if (popover) {
      popover.style.display = 'none';
    }
  },
};
