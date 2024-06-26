import { PlaneDrag } from './dragUtil';

export default {
  bind(el, binding, vnode) {
    const value = binding.value;
    const left = value?.left || 0;
    const top = value?.top || 0;
    new PlaneDrag({ dom: el, left, top });
  },
};
