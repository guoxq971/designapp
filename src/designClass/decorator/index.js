import { DESIGN_TYPE } from '@/designClass/core/define';
import { nextTick } from 'vue';

/**
 * 背景不能操作
 * @param target
 * @param name
 * @param descriptor
 * @returns {*}
 */
export function notAllowedBackground(target, name, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    if ([DESIGN_TYPE.backgroundImage, DESIGN_TYPE.backgroundColor].includes(this.type)) {
      return;
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

/**
 * 更新材质
 * @prop {any} returnKey 有传returnKey时,匹配到return的相同值,不执行
 * @returns {*}
 */
export function updateMesh(returnKey = undefined) {
  return function(target, name, descriptor) {
    const method = descriptor.value;
    descriptor.value = function(...args) {
      const result = method.apply(this, args);
      if (returnKey === undefined) {
        this.updateMesh();
      } else {
        if (result !== returnKey) {
          this.updateMesh();
        }
      }
      return result;
    };
    return descriptor;
  };
}

/**
 * 背景色不能操作
 * @param target
 * @param name
 * @param descriptor
 * @returns {*}
 */
export function notAllowedBackgroundColor(target, name, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    if ([DESIGN_TYPE.backgroundColor].includes(this.type)) {
      return;
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

/**
 * 文字-不能操作
 * @param target
 * @param name
 * @param descriptor
 * @returns {*}
 */
export function notAllowedText(target, name, descriptor) {
  const originalMethod = descriptor.value;
  descriptor.value = function(...args) {
    if ([DESIGN_TYPE.text].includes(this.type)) {
      return;
    }
    return originalMethod.apply(this, args);
  };
  return descriptor;
}

/**
 * 更新平铺
 * @prop {any} returnKey 有传returnKey时,匹配到return的相同值,不执行
 * @prop {boolean} force 是否强制刷新
 * @returns {*}
 */
export function updateTile(returnKey = undefined, force = false) {
  return function(target, name, descriptor) {
    const method = descriptor.value;
    descriptor.value = function(...args) {
      const result = method.apply(this, args);
      if (returnKey === undefined) {
        nextTick(() => this.tileClass?.change(force));
      } else {
        if (result !== returnKey) {
          nextTick(() => this.tileClass?.change(force));
        }
      }
      return result;
    };
    return descriptor;
  };
}

/**
 * 防抖函数
 * @param delay
 * @returns {function(*, *, *): *}
 */
export function debounce(delay = 50) {
  return function(target, key, descriptor) {
    const originalMethod = descriptor.value;
    let timer;

    descriptor.value = function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        originalMethod.apply(this, args);
      }, delay);
    };

    return descriptor;
  };
}
