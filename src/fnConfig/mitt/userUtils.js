import mitt from 'mitt';
const $emitter = mitt();
const emitType = 'fn-update-userName';

/**
 * 修改用户名的监听事件
 */

// 监听事件
// $emitter.on(typeName, callback)
// 触发事件
// $emitter.emit(typeName, {type, data})
// 移除事件
// $emitter.off(typeName)

export function updateUserName() {
  // 监听事件
  const registerUpdateUserName = (callback = null) => {
    $emitter.on(emitType, (data) => {
      callback && callback(data);
    });
  };

  // 触发事件
  const emitUpdateUserName = (data) => {
    $emitter.emit(emitType, { type: emitType, data });
  };

  // 移除事件
  const unRegisterUpdateUserName = () => {
    $emitter.off(emitType);
  };

  return {
    registerUpdateUserName,
    emitUpdateUserName,
    unRegisterUpdateUserName,
  };
}
