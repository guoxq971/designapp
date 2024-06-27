import { computed, nextTick } from 'vue';
import { Test } from '@/designClass/core/template/Test';
import { Raycaster } from './raycaster.js';
import { CANVAS_SIZE } from '@/fnDesigner/config/common';
import { sleep } from '@/fnDesigner/js/common';
import * as THREE from 'three';

export class Template3d {
  /**@type {DesignerApp} 设计器*/
  $app;

  /**@type {Template} 模板*/
  $template;

  /**@type {Test} 3d*/
  three;

  /**@type {boolean} 加载*/
  loading = false;

  /**@type {Raycaster} raycaster射线*/
  raycaster;

  /**
   * @typedef MeshItem
   * @prop {string} viewId
   * @prop {THREE.Mesh} mesh
   * */
  /**@type {MeshItem[]} 材质列表*/
  meshList = [];

  /**
   * @typedef CameraPositoinItem
   * @prop {string} viewId
   * @prop {object} position
   * */
  /**@type {CameraPositoinItem[]} 相机角度列表*/
  cameraPositionList = [];

  /**@type {object} 当前鼠标坐标*/
  mouseDownPos = {};

  /**@type {null|function} 销毁鼠标事件*/
  destroyMouse;

  constructor($app, $template) {
    this.$app = $app;
    this.$template = $template;
  }

  /**
   * 是否能加载3d
   * @type {boolean}
   */
  isSureLoad3d = computed(() => {
    let result;
    const config3d = this.$template?.config3d;
    result = config3d?.hasUpload3d === 1 && config3d?.openflag3d === 0 && config3d?.uvdflag === 1 && config3d?.glbPath;
    return result;
  });

  /**
   * 开启3d循环
   */
  openAnimate() {
    if (this.three) {
      this.three.animateFlag = true;
    }
  }

  /**
   * 关闭3d循环
   */
  closeAnimate() {
    if (this.three) {
      this.three.animateFlag = false;
    }
  }

  /**
   * 更新材质
   */
  updateMesh() {
    this.$template?.viewList?.forEach((view) => view.updateMesh());
  }

  /**
   * 创建3d
   * @param {HTMLElement} container 容器
   * @param {function=} createCallback 创建完成之后
   */
  create3d(container, createCallback) {
    this.three = new Test();
    this.three.create({
      path: process.env.VUE_APP_API_BASE_IMG_URL + this.$template.config3d.glbPath,
      container,
      loadModelBefore: () => (this.loading = true),
      loadModelFinally: () => (this.loading = false),
      loadModelSuccess: (model, meshModelList) => {
        nextTick(() => {
          // 绑定材质
          this.bindCanvas(meshModelList);
          // 注册射线
          this.registerRaycaster(container, this.three.camera, this.three.controls);
          // 注册鼠标事件
          this.destroyMouse = this.registerMouseEvent(this.three.renderer.domElement);

          createCallback && createCallback();
        });
      },
    });
  }

  /**
   * 休眠
   */
  sleep() {
    this.meshList?.forEach((item) => {
      item.mesh.material.map?.dispose();
      item.mesh.material.map = null;
      item.mesh = null;
    });
    this.meshList = [];
    // 销毁模型
    this.three?.destroy();
    // 销毁射线
    this.raycaster?.destroy();
    // 销毁点击事件(切换模式)
    this.destroyMouse && this.destroyMouse();
    this.destroyMouse = null;
    this.three = null;
    this.raycaster = null;
  }

  /**
   * 销毁3d - 模型 & 鼠标事件 & 材质
   */
  destroy() {
    this.meshList?.forEach((item) => {
      item.mesh.material.map?.dispose();
      item.mesh.material.map = null;
      item.mesh = null;
    });
    this.meshList = [];
    // 销毁模型
    this.three?.destroy();
    // 销毁射线
    this.raycaster?.destroy();
    // 销毁点击事件(切换模式)
    this.destroyMouse && this.destroyMouse();

    this.$app = null;
    this.$template = null;
    this.three = null;
    this.loading = false;
    this.raycaster = null;
    this.meshList = null;
    this.cameraPositionList = null;
    this.mouseDownPos = null;
    this.destroyMouse = null;
  }

  /**
   * 绑定材质
   * @param {THREE.Mesh} meshModelList
   */
  bindCanvas(meshModelList) {
    // console.log('bindCanvas', meshModelList, three);
    const viewList3d = this.$template.config3d.viewList;
    const colorList3d = this.$template.config3d.colorList;
    const colorItem = this.$template.detail.appearances.find((e) => e.id == this.$app.activeColorId);
    const activeColorList3d = colorList3d.find((e) => e.colorName === colorItem.name);

    const viewList = this.$template.viewList;

    // 根据产品视图遍历,绑定材质
    for (let view of viewList) {
      // 颜色配置3d
      const color3d = activeColorList3d.list?.find((e) => e.viewId == view.id);
      // 视图配置3d
      const view3d = viewList3d.find((e) => e.viewId == view.id);
      // 视图配置canvas
      const viewCanvas = view.canvas;
      const activeViewId = this.$app.activeViewId;

      // 如果存在视图配置
      if (view3d && viewCanvas) {
        // 视图canvas节点
        const canvasDOM = viewCanvas.layer.canvas._canvas;
        // 视图mesh模型
        const mesh = meshModelList.find((e) => e.name.split('.')[0] === view3d.materialName);

        // console.log('view', view);
        // console.log('view3d', view3d);
        // console.log('color3d', color3d);
        // console.log('mesh', mesh);
        // console.log('viewCanvas', viewCanvas);
        // console.log('canvasDOM', canvasDOM);

        // 添加到mesh列表
        this.meshList.push({
          viewId: view.id,
          mesh,
        });

        // 配置底色
        if (color3d?.colorCode) {
          if (viewCanvas.threeGroup.children.length) {
            viewCanvas.threeGroup.children[0].setAttrs({
              fill: color3d?.colorCode,
              visible: true,
            });
          }
        }

        // 配置相机
        if (view3d?.cameraPosition) {
          const parseCameraPosition = JSON.parse(view3d.cameraPosition);
          this.cameraPositionList.push({
            viewId: view.id,
            position: parseCameraPosition,
          });
          if (activeViewId === view.id) {
            nextTick(() => view.cameraAnimation(null, 0));
          }
        }

        // 透明处理
        // const context = canvasDOM.getContext('2d');
        // context.clearRect(0, 0, canvasDOM.width, canvasDOM.height);
        // mesh.material.transparent = true;
        // 绑定canvas
        const texture = new THREE.CanvasTexture(canvasDOM);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        mesh.material.map = texture;
        setTimeout(() => (mesh.material.map.needsUpdate = true), 50);
      }
    }
  }

  /**
   * 注册射线
   * @param {HTMLElement} container 容器
   * @param {THREE.Camera} camera 相机
   * @param {THREE.OrbitControls} controls 控制器
   */
  registerRaycaster(container, camera, controls) {
    // 注册射线
    this.raycaster = new Raycaster({
      mousedownFn: () => {
        // console.log('mousedownFn');
        if (this.$app.activeView.canvas.transformer.nodes().length > 0) {
          this.$app.activeDesign?.updateMesh();
        }
      },
      mousemoveFn: () => {
        if (this.$app.activeView.canvas.transformer.nodes().length > 0) {
          this.$app.activeDesign?.updateMesh({ multi: false });
        }
      },
      mouseupFn: () => {
        // console.log('mouseupFn');
        if (this.$app.activeView.canvas.transformer.nodes().length > 0) {
          this.$app.activeDesign?.updateMesh();
        }
      },
      // 是否有选中设计图
      hasActiveDesign: (materialName) => {
        return this.$app.activeView.canvas.transformer.nodes().length > 0;
      },
      // 设置坐标在canvas上
      setPos: async (materialName, uv, event) => {
        const typeArr = ['mousedown', 'mouseup', 'mousemove'];
        if (!typeArr.includes(event?.type)) {
          return;
        }

        // canvas, texture
        const view = this.$app.activeView;
        const canvas = this.$app.activeView.canvas.layer?.canvas._canvas;
        const mesh = this.meshList.find((e) => e.viewId == view.id);
        if (!canvas || !mesh || !view) {
          console.log('setPos error');
          return;
        }

        if (this.$app.modelOperational) {
          // 切换view
          this.$app.activeViewId = view.id;
        }

        const evt = event;
        if (evt) {
          // 映射到画布的坐标
          const rect = canvas.getBoundingClientRect();
          const width = CANVAS_SIZE;
          const height = CANVAS_SIZE;
          const xCross = uv.x * width + rect.left;
          const yCross = uv.y * height + rect.top;

          const event = new MouseEvent(evt.type, {
            bubbles: true, // 是否冒泡
            clientX: xCross,
            clientY: yCross,
          });

          // 模拟鼠标事件在canvas上触发(为了触发选中设计图,konva是鼠标抬起才会触发选中设计图)
          if (evt.type === 'mousedown') {
            const event2 = new MouseEvent('mouseup', {
              bubbles: true, // 是否冒泡
              clientX: xCross,
              clientY: yCross,
            });
            canvas.dispatchEvent(event);
            canvas.dispatchEvent(event2);

            await sleep(0);
          }

          canvas.dispatchEvent(event);
        }
      },
      // 获取mesh列表
      getMeshList: () => this.meshList.map((e) => e.mesh),
      meshList: this.meshList.map((e) => e.mesh),
      container: container,
      camera: camera,
      controls: controls,
      // 是否进行模型交互
      modelOperationalFn: () => {
        return this.$app.modelOperational;
      },
    });
  }

  /**
   * 注册鼠标事件
   * @param {HTMLElement} dom
   * @returns {(function(): void)|*}
   */
  registerMouseEvent(dom) {
    const that = this;
    function fn1(e) {
      that.mouseDownPos = { x: e.clientX, y: e.clientY };
    }
    function fn2(e) {
      if (that.mouseDownPos.x === e.clientX && that.mouseDownPos.y === e.clientY) {
        that.$app.setModeEdit(true);
      }
    }

    nextTick(() => {
      // dom 注册鼠标按下和鼠标抬起事件，如果按下和抬起的坐标一致，则打印一下
      dom.addEventListener('mousedown', fn1);
      dom.addEventListener('mouseup', fn2);
    });

    // 返回销毁
    return () => {
      dom.removeEventListener('mousedown', fn1);
      dom.removeEventListener('mouseup', fn2);
    };
  }
}
