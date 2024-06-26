export function bindInit(el, binding, showTitle) {
  // 使用 const 声明一个只读的常量，其值是需要监听的事件类型列表
  const events = ['mouseenter', 'mouseleave', 'click'];

  // 声明一个处理器，以根据不同的事件类型传不同的参数
  function handler(event) {
    if (event.type === 'mouseenter') {
      // 显示一个提示框
      showTitle(el, binding.value);
    } else {
      // 隐藏一个提示框
      showTitle();
    }
  }

  // 销毁时移除事件监听
  function destroy() {
    // 移除 el 元素上的事件监听
    events.forEach((event) => {
      el.removeEventListener(event, handler, false);
    });
    // 移除 el 元素上的 destroy
    el.destroy = null;
  }

  // 初始化
  function init() {
    // 在 el 元素上添加事件监听
    events.forEach((event) => {
      el.addEventListener(event, handler, false);
    });

    // 在 el 元素上添加一个属性，以在其他钩子进行访问
    el.destroy = () => {
      // 移除 el 元素上的事件监听
      events.forEach((event) => {
        el.removeEventListener(event, handler, false);
      });
      // 移除 el 元素上的 destroy
      el.destroy = null;
    };
  }

  return {
    handler,
    init,
    destroy,
  };
}
