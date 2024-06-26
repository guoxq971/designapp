import mitt from 'mitt';
const $emitter = mitt();
const emitType = 'fn-login';

/**
 * 修改用户名的监听事件
 */

// 监听事件
// $emitter.on(typeName, callback)
// 触发事件
// $emitter.emit(typeName, {type, data})
// 移除事件
// $emitter.off(typeName)

export function fnMittLogin() {
  // 监听事件
  const on = (callback = null) => {
    $emitter.on(emitType, (data) => {
      callback && callback(data);
    });
  };

  // 触发事件
  const emit = (data = { isLogin: false }) => {
    $emitter.emit(emitType, { type: emitType, data });
  };

  // 移除事件
  const off = (callback = null) => {
    if (callback) {
      $emitter.off(emitType, callback);
    } else {
      $emitter.off(emitType);
    }
  };

  return {
    on,
    emit,
    off,
  };
}
