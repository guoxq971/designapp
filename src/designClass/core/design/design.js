import { DESIGN_TYPE } from '@/designClass/core/define';
import { isMax } from '@/designClass/util/view/transformerUtil';
import { Message } from 'element-ui';
import { getAngleMultiple, getBox, getPrintBox, getScaleMax, isOutSideNode } from '@/designClass/util/view/viewUtil';
import { getUuid } from '@/utils/fnUtils';
import { notAllowedBackground, notAllowedBackgroundColor, notAllowedText, updateMesh, updateTile } from '@/designClass/decorator';
import lodash from 'lodash';
import { nextTick } from 'vue';

/**
 * 设计图操作
 */
export class DesignHandle {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {View} 视图*/
  $view;
  /**@type {boolean} 是否设计*/
  isDesign = true;
  /**@type {DESIGN_TYPE}*/
  type;
  /**@type {Konva.Image|Konva.text} 节点*/
  node;
  /**@type {string} 监听设计*/
  watchImageUuid;
  /**@type {string} fnUuid*/
  fnUuid;
  /**@type {Tile} 平铺*/
  tileClass;

  /**
   * 碰撞检测
   * @returns {boolean} 是否碰撞 true:碰撞 false:未碰撞
   */
  isCollide() {
    const print = this.$view.getInfo();
    const node = this.node;
    const offsetX = node.attrs.offsetX * node.attrs.scaleX;
    const x = node.attrs.x - offsetX;
    const offsetY = node.attrs.offsetY * node.attrs.scaleY;
    const y = node.attrs.y - offsetY;
    const width = node.attrs.width * node.attrs.scaleX;
    const height = node.attrs.height * node.attrs.scaleY;

    const printWidth = print.width;
    const printHeight = print.height;

    return x < 0 || y < 0 || x + width > printWidth || y + height > printHeight;
  }

  /**
   * 超出边界
   * @param {Function=null} outCallback 超出边界回调
   */
  isOutSide(outCallback = null) {
    const designBox = getBox(this.node).bbox;
    const printBox = getPrintBox(this.$view.getInfo()).bbox;
    const result = isOutSideNode(designBox, printBox);
    if (result) {
      outCallback && outCallback();
    }

    if (!outCallback) {
      return result;
    }
  }

  /**
   * 图层上移动
   * */
  @notAllowedBackground
  @updateMesh()
  moveUp() {
    const designList = this.$view.canvas.group.getChildren().filter((e) => e.attrs.type !== DESIGN_TYPE.tile);
    const i = designList.findIndex((node) => node === this.node);
    const prevIndex = designList[i + 1].getZIndex();
    this.node.zIndex(prevIndex);
    nextTick(() => {
      designList.forEach((node) => node.attrs.$design.tileClass?.node?.zIndex(node.getZIndex()));
    });
  }

  /**
   * 图层下移动
   * */
  @notAllowedBackground
  @updateMesh()
  moveDown() {
    const designList = this.$view.canvas.group.getChildren().filter((e) => e.attrs.type !== DESIGN_TYPE.tile);
    const i = designList.findIndex((node) => node === this.node);
    const nextIndex = designList[i - 1].getZIndex();
    this.node.zIndex(nextIndex);
    nextTick(() => {
      designList.forEach((node) => node.attrs.$design.tileClass?.node?.zIndex(node.getZIndex()));
    });
  }

  /**
   * 图层置底
   * */
  @notAllowedBackground
  @updateMesh()
  moveBottom() {
    const designList = this.$view.canvas.group.getChildren().filter((e) => e.attrs.type !== DESIGN_TYPE.tile);
    const minIndex = Math.min(...designList.map((node) => node.getZIndex()));
    this.node.zIndex(minIndex);
    nextTick(() => {
      designList.forEach((node) => node.attrs.$design.tileClass?.node?.zIndex(node.getZIndex()));
    });
  }

  /**
   * 图层置底
   * */
  @notAllowedBackground
  @updateMesh()
  moveTop() {
    const designList = this.$view.canvas.group.getChildren().filter((e) => e.attrs.type !== DESIGN_TYPE.tile);
    const maxIndex = Math.max(...designList.map((node) => node.getZIndex()));
    this.node.zIndex(maxIndex);
    nextTick(() => {
      designList.forEach((node) => node.attrs.$design.tileClass?.node?.zIndex(node.getZIndex()));
    });
  }

  /**
   * 图层删除
   * */
  @updateMesh()
  remove() {
    // 删除节点
    switch (this.type) {
      case DESIGN_TYPE.backgroundImage:
      case DESIGN_TYPE.backgroundColor:
        this.$template.viewList.forEach((view) => {
          view.canvas.backgroundGroup.children.forEach((node) => {
            node.destroy();
            node.$design.tileClass?.destroy();
            if (node === view.canvas.transformer.node()) view.setActiveNull();
          });
        });
        break;
      case DESIGN_TYPE.image:
      case DESIGN_TYPE.text:
        this.node.destroy();
        this.tileClass?.destroy();
        if (this.node === this.$view.canvas.transformer.node()) {
          this.$view.setActiveNull();
        }
        break;
    }

    // 删除数据
    switch (this.type) {
      case DESIGN_TYPE.backgroundColor:
      case DESIGN_TYPE.backgroundImage:
        this.$template.viewList.forEach((view) => {
          view.designList.splice(
            view.designList.findIndex((e) => e.type === this.type),
            1,
          );
        });
        break;
      case DESIGN_TYPE.image:
      case DESIGN_TYPE.text:
        this.$view.designList.splice(
          this.$view.designList.findIndex((e) => e.fnUuid === this.fnUuid),
          1,
        );
        break;
    }
  }

  /**
   * 图层显示隐藏
   * */
  @updateMesh()
  visible() {
    switch (this.type) {
      case DESIGN_TYPE.backgroundImage:
      case DESIGN_TYPE.backgroundColor:
        this.$template.viewList.forEach((view) => {
          view.canvas.backgroundGroup.children.forEach((node) => {
            node.visible(!node.visible());
            if (node === view.canvas.transformer.node()) view.setActiveNull();
          });
        });
        break;
      case DESIGN_TYPE.image:
      case DESIGN_TYPE.text:
        this.node.visible(!this.node.visible());
        if (this.node === this.$view.canvas.transformer.node()) {
          this.$view.setActiveNull();
        }
        break;
    }
  }

  /**
   * 图层水平翻转
   * */
  @notAllowedBackgroundColor
  @updateTile(undefined, true)
  @updateMesh()
  flipHorizontal() {
    this.node.setAttrs({
      scaleX: -this.node.scaleX(),
    });
  }

  /**
   * 图层垂直翻转
   * */
  @notAllowedBackgroundColor
  @updateTile(undefined, true)
  @updateMesh()
  flipVertical() {
    this.node.setAttrs({
      scaleY: -this.node.scaleY(),
    });
  }

  /**
   * 图层水平居中
   * */
  @notAllowedBackgroundColor
  @updateTile()
  @updateMesh()
  centerHorizontal() {
    const viewInfo = this.$view.getInfo();
    this.node.x(viewInfo.print.width / 2);
  }

  /**
   * 图层垂直居中
   * */
  @notAllowedBackgroundColor
  @updateTile()
  @updateMesh()
  centerVertical() {
    const viewInfo = this.$view.getInfo();
    this.node.y(viewInfo.print.height / 2);
  }

  /**
   * 图层水平垂直居中
   * */
  @notAllowedBackgroundColor
  @updateTile(undefined)
  @updateMesh()
  centerHV() {
    const viewInfo = this.$view.getInfo();
    this.node.setAttrs({
      x: viewInfo.print.width / 2,
      y: viewInfo.print.height / 2,
    });
  }

  /**
   * 图层放大
   * */
  @notAllowedBackgroundColor
  @updateTile(undefined, true)
  @updateMesh()
  scaleUp(step = 0.005) {
    if (!isMax(this.node)) {
      this.node.setAttrs({
        scaleX: (Math.abs(this.node.scaleX()) + step) * (this.node.scaleX() < 0 ? -1 : 1),
        scaleY: (Math.abs(this.node.scaleY()) + step) * (this.node.scaleY() < 0 ? -1 : 1),
      });
    }
  }

  /**
   * 图层缩小
   * */
  @notAllowedBackgroundColor
  @updateTile(undefined, true)
  @updateMesh()
  scaleDown(step = 0.005) {
    this.node.setAttrs({
      scaleX: (Math.abs(this.node.scaleX()) - step) * (this.node.scaleX() < 0 ? -1 : 1),
      scaleY: (Math.abs(this.node.scaleY()) - step) * (this.node.scaleY() < 0 ? -1 : 1),
    });
  }

  /**
   * 图层旋转-右边
   * */
  @notAllowedBackgroundColor
  @updateTile()
  @updateMesh()
  rotateUp(step = 45) {
    const rotate = getAngleMultiple(this.node.rotation(), 'left', step);
    this.node.rotation(rotate);
  }

  /**
   * 图层旋转-左边
   * */
  @notAllowedBackgroundColor
  @updateTile()
  @updateMesh()
  rotateDown(step = 45) {
    const rotate = getAngleMultiple(this.node.rotation(), 'right', step);
    this.node.rotation(rotate);
  }

  /**
   * 图层最大化
   * */
  @notAllowedBackgroundColor
  @updateTile(false, true)
  @updateMesh(false)
  max(type = '') {
    if ([DESIGN_TYPE.text].includes(this.type)) {
      Message.warning('文字不能最大化操作');
      return false;
    }
    const viewInfo = this.$view.getInfo();
    const maxScale = getScaleMax(type, this.node.attrs.inch, viewInfo.print, { width: this.node.width(), height: this.node.height() });
    // 最大化
    this.node.setAttrs({
      scaleX: maxScale.scaleX,
      scaleY: maxScale.scaleY,
    });

    this.node.rotation(0);

    // 居中
    this.node.setAttrs({
      x: viewInfo.print.width / 2,
      y: viewInfo.print.height / 2,
    });
  }

  /**
   * 图层复制
   */
  @notAllowedBackgroundColor
  @updateMesh(false)
  copy() {
    if ([DESIGN_TYPE.backgroundImage].includes(this.type)) {
      Message.warning('背景图不能复制');
      return false;
    }
    const detail = this.node.attrs.detail;
    const param = { ...this.node.attrs.param, fnUuid: '' };
    switch (this.type) {
      case DESIGN_TYPE.image:
        this.$view.addDesignImage(detail, {
          x: this.node.x() + 10,
          y: this.node.y() + 10,
          scaleX: this.node.scaleX(),
          scaleY: this.node.scaleY(),
          rotation: this.node.rotation(),
        });
        break;
      case DESIGN_TYPE.text:
        this.$view.addDesignText(param, {
          x: this.node.attrs.x + 10,
          y: this.node.attrs.y + 10,
          scaleX: this.node.attrs.scaleX,
          scaleY: this.node.attrs.scaleY,
          rotation: this.node.attrs.rotation,
          text: this.node.attrs.text,
          fill: this.node.attrs.fill,
          fontSize: this.node.attrs.fontSize,
          fontFamily: this.node.attrs.fontFamily,
          fontStyle: this.node.attrs.fontStyle,
          textDecoration: this.node.attrs.textDecoration,
          textAnchor: this.node.attrs.textAnchor,
          letterSpacing: this.node.attrs.letterSpacing,
          lineHeight: this.node.attrs.lineHeight,
        });
        break;
      default:
        console.log('default');
        break;
    }
  }

  /**
   * 图层-平铺
   */
  @notAllowedText
  @notAllowedBackgroundColor
  @updateMesh()
  tile(force = false) {
    if (!this.tileClass.node) {
      this.tileClass.create();
    } else {
      this.tileClass.change(force);
    }
  }

  /**
   * 设计-激活
   */
  @notAllowedBackgroundColor
  active() {
    this.$view.setActiveDesign(this);
  }

  /**
   * 监听-更新监听值
   */
  updateWatch() {
    this.watchImageUuid = getUuid();
  }

  /**
   * 监听-初始化监听
   */
  addEventListener() {
    this.dragend();
    this.mousedown();
  }

  /**
   * 监听-拖拽结束
   */
  @notAllowedBackgroundColor
  dragend() {
    this.node.on('dragend', (e) => {
      if (this.$app.isShow2d) {
        // 超出移除 整体移动到边界之外，则删除
        this.isOutSide(() => this.remove());
      }
      this.updateWatch();
      this.tileClass?.change();
    });
  }

  /**
   * 监听-设计按下
   */
  @notAllowedBackgroundColor
  mousedown() {
    this.node.on('mousedown', (e) => {
      // 选中
      this.active();
      // 编辑模式
      this.$app.setModeEdit();
    });
  }

  /**
   * 获取设计信息
   * @returns {{width: number, height: number, rotation: number, x: number, y: number}}
   */
  @notAllowedBackgroundColor
  getInfo() {
    const imgWidth = lodash.round(this.node.attrs.width * Math.abs(this.node.attrs.scaleX), 2);
    const imgHeight = lodash.round(this.node.attrs.height * Math.abs(this.node.attrs.scaleY), 2);
    const angle = this.node.attrs.rotation;
    const x = lodash.round(this.node.attrs.x - imgWidth / 2, 2);
    const y = lodash.round(this.node.attrs.y - imgHeight / 2, 2);

    return {
      width: imgWidth,
      height: imgHeight,
      rotation: angle,
      x,
      y,
    };
  }

  /**
   * 获取设计图提交数据
   * @returns {configuration}
   */
  @notAllowedBackgroundColor
  @notAllowedText
  getSubmitImageData() {
    const info = this.getInfo();
    const detail = this.node.attrs.$design.detail;
    return {
      type: 'design',
      printArea: { id: this.$view.id },
      offset: { x: info.x, y: info.y, unit: 'mm' },
      content: {
        dpi: this.$template.detail.dpi,
        unit: 'mm',
        svg: {
          image: {
            designId: detail.id,
            width: info.width,
            height: info.height,
            isBg: Number(detail.isBg),
            transform: `rotate(${info.rotation},${info.width / 2},${info.height / 2})`,
            hspacing: 0,
            vspacing: 0,
            printColorRGBs: '',
            tileType: '',
          },
        },
      },
      printType: { id: 17 },
      isCopy: '',
      isText: false,
      textId: '',
      restrictions: { changeable: true },
    };
  }

  /**
   * 更新材质
   * @param {updateMeshOpt} opt
   */
  updateMesh(opt = {}) {
    this.$view.updateMesh(opt);
  }
}
