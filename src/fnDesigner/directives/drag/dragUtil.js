/*==============================
 * Project: demo
 * Description:拖拉拽组件
 * @author:danzizhong
 * Time：2021.03.10
=================================*/

/**
 * 拖拽
 * @param {object} opt
 */
export function PlaneDrag(opt) {
  this.opt = Object.assign(
    {
      dom: null,
      top: 0,
      left: 0,
    },
    opt,
  );

  this.style();
  this.mouse();

  return this;
}

PlaneDrag.prototype.style = function () {
  const top = this.opt.top.toString().indexOf('px') > -1 ? this.opt.top : this.opt.top + 'px';
  const left = this.opt.left.toString().indexOf('px') > -1 ? this.opt.left : this.opt.left + 'px';

  const style = {
    position: 'fixed',
    zIndex: 10,
    top: top,
    left: left,
    // top:0,
    // left:0,
    // transform: `translate(${left},${top})`,
  };
  Object.assign(this.opt.dom.style, style);
};

/**
 * mouse函数使用 transform:translate(x,y)做位移
 */
PlaneDrag.prototype.mouse = function () {
  const dom = this.opt.dom;
  const _this = this;
  let disX = 0;
  let disY = 0;
  let left = 0;
  let top = 0;
  let isDown = false;

  dom.addEventListener('mousedown', function (e) {
    disX = e.clientX - dom.offsetLeft;
    disY = e.clientY - dom.offsetTop;
    isDown = true;

    document.addEventListener('mousemove', mousemove);

    document.addEventListener('mouseup', mouseup);
  });

  function mousemove(e) {
    if (isDown) {
      left = e.clientX - disX;
      top = e.clientY - disY;
      dom.style.left = left + 'px';
      dom.style.top = top + 'px';
      // dom.style.transform = `translate(${left}px,${top}px)`;
    }
  }

  function mouseup() {
    isDown = false;
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
  }
};
