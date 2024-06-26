import { onBeforeUnmount, onMounted } from 'vue';

/**
 * 扫码枪监听
 * @param {Object} opt
 * @param {Function} opt.onScan 扫码枪输入回调
 * @param {Function} opt.onBeforeScan 扫码枪首次输入回调
 */
export function useScan(opt) {
  const { onScan, onBeforeScan } = Object.assign({ onScan: null }, opt);

  let code = ''; // 扫码枪输入的内容
  let lastTime = ''; // 上次输入的时间
  let nextTime = ''; // 当前输入的时间
  let lastCode = ''; // 上次输入的内容
  let nextCode = ''; // 当前输入的内容
  let isFirst = true;

  const handleKeyPress = (e) => {
    if (window.event) {
      // IE
      nextCode = e.keyCode;
    } else if (e.which) {
      // Netscape/Firefox/Opera
      nextCode = e.which;
    }

    if (isFirst) {
      console.log('扫码前。。。');
      isFirst = false;
      onBeforeScan && onBeforeScan({ code, isFocus, event: e });
    }

    if (e.which === 13) {
      if (code.length < 3) {
        // 手动输入的时间不会让code的长度大于2，所以这里只会对扫码枪有
        return;
      }
      console.log('扫码结束');
      isFirst = true;
      onScan && onScan({ code, isFocus, event: e });

      code = '';
      lastCode = '';
      lastTime = '';
      return;
    }
    nextTime = new Date().getTime();
    if (!lastTime && !lastCode) {
      console.log('扫码开始。。。');
      code += e.key;
    }

    // 当扫码前有keypress事件时,防止首字缺失
    if (lastCode && lastTime && nextTime - lastTime > 500) {
      console.log('防止首字缺失。。。');
      code = e.key;
    } else if (lastCode && lastTime) {
      console.log('扫码中。。。');
      code += e.key;
    }
    lastCode = nextCode;
    lastTime = nextTime;
  };

  onMounted(() => {
    window.addEventListener('keypress', handleKeyPress);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('keypress', handleKeyPress);
  });

  return {
    isFocus,
  };
}

// 判断组件是否处于聚焦状态
const isFocus = (iptRef) => {
  // 取值 iptRef.value 的 input 元素
  let ipt = iptRef?.value?.$el;
  if (!ipt) {
    console.error('iptRef?.value?.$el错误，请传入 ref');
    return false;
  }
  if (iptRef.value.$el.localName !== 'input') {
    ipt = iptRef.value.$el.querySelector('input');
  }
  return document.activeElement === ipt;
};
