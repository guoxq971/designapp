import { defineStore, storeToRefs } from 'pinia';
import { Ref, ref } from 'vue';
import { DesignerApp } from '@/designClass/core/designerAPP/designerApp';

/**
 * 设计器
 // * @typedef {Object} DesignerInterface -
 // * @prop {array} templateList
 // * @prop {function} setTemplate
 // * @property {string} prop1 - SpecialType 属性 prop1 是 string 类型
 // * @property {number} prop2 - SpecialType 属性 prop2 是 number 类型
 // * @property {number=} prop3 - SpecialType 属性 prop3 是可选的 number 类型
 // * @prop {number} [prop4] - SpecialType 属性 prop4 是可选的 number 类型
 // * @prop {number} [prop5=42] - SpecialType 属性 prop5 是可选的 number 类型（默认值 42））
 */

/**
 * @func
 * @return {Ref<DesignerApp>}
 * */
export const useDesignerClassStore = defineStore('fn-designerAPP-store-class', () => {
  const designer = ref(new DesignerApp());
  return { designer };
});

/**
 * 返回设计器的双向绑定使用
 * @func
 * @return Ref<DesignerApp>
 * */
export function designStoreToRefs() {
  const { designer } = storeToRefs(useDesignerClassStore());

  return designer;
}
