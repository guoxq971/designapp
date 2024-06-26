import * as THREE from 'three';
import { sleep } from '@/fnDesigner/js/common';
import { useKonvaCustomMouse } from '@/fnDesigner/three/konva';

/**
 * 射线
 * @class
 * */
export class Raycaster {
  raycaster; //射线
  mouse; //鼠标
  activeMesh; //当前射线选中的mesh

  container; //容器
  scene; //场景
  camera; //相机
  controls; //控制器

  // 是否在同一个地方按下和抬起
  isSameClick = false;
  isDown = false; //是否按下
  addEventObj = {}; //事件对象

  /**
   * 构造函数
   * */
  constructor(three, param) {
    // 鼠标按下前的坐标
    let downMousePos = {
      x: 0,
      y: 0,
    };

    // 使用到three的操作
    const _three = {
      modelOperationalFn: three.modelOperationalFn,
      // 判断是否有选中了设计图，没有的话就退出konva自定义鼠标事件
      hasActiveDesign: three.hasActiveDesign,
      // 设置坐标在canvas上
      setPos: three?.setPos,
      // 获取mesh列表
      getMeshList: three?.getMeshList,
      meshList: three.meshList,
      container: three.container,
      camera: three.camera,
      controls: three.controls,
      mousedownFn: three.mousedownFn,
      mouseupFn: three.mouseupFn,
      mousemoveFn: three.mousemoveFn,
      openCustomMouse: () => useKonvaCustomMouse().open(),
      closeCustomMouse: () => useKonvaCustomMouse().close(),
    };

    param = {
      beforeMouseDown: (uv, object, evt) => {
        // console.log('beforeMouseDown uv, object, evt', uv, object, evt);
        // 记录鼠标按下的坐标
        downMousePos.x = evt.clientX;
        downMousePos.y = evt.clientY;

        // 这个函数返回 false 就不执行模型操作
        if (!_three.modelOperationalFn()) {
          return false;
        }

        // 没有选中模型, 不触发射线交互
        if (!uv) {
          // console.log('down 不存在uv');
          return false;
        }
        // 没有选中模型, 不触发射线交互
        if (!object?.material?.name) {
          console.log('down 不存在material.name');
          return false;
        }

        return true;
      },
      afterMouseDown: async (uv, object) => {
        await sleep(0);
        //  判断是否有选中了设计图，没有的话就退出konva自定义鼠标事件
        if (!_three.hasActiveDesign(object.material.name)) {
          this.setStatus('up'); // 设置状态为抬起
        }
        _three.mousedownFn && _three.mousedownFn();
      },
      beforeMouseMove: () => this.isDown,
      afterMouseMove: () => {
        _three.mousemoveFn && _three.mousemoveFn();
      },
      beforeMouseUp: () => true,
      afterMouseUp: (object, evt) => {
        _three.mouseupFn && _three.mouseupFn();
      },
      setPos: (materialName, uv, event) => _three.setPos(materialName, uv, event),
      getMeshList: () => _three?.getMeshList() || [],
      setStatusDown: () => _three.openCustomMouse(),
      setStatusUp: () => _three.closeCustomMouse(),
      meshList: _three.meshList || [],
      container: _three.container,
      camera: _three.camera,
      controls: _three.controls,
    };

    // 鼠标移动前 是否执行 true-执行 false-不执行
    this.beforeMouseMove = param.beforeMouseMove || (() => true);
    // 鼠标抬起前 是否执行 true-执行 false-不执行
    this.beforeMouseUp = param.beforeMouseUp || (() => true);
    // 鼠标按下前 是否执行 true-执行 false-不执行
    this.beforeMouseDown = param.beforeMouseDown || (() => true);
    // 鼠标按下后
    this.afterMouseDown = param.afterMouseDown || (() => true);
    // 鼠标移动后
    this.afterMouseMove = param.afterMouseMove || (() => true);
    // 鼠标抬起后
    this.afterMouseUp = param.afterMouseUp || (() => true);
    // 设置鼠标位置
    this.setPos = param.setPos || (() => true);
    // 获取材质列表
    this.getMeshList = param.getMeshList || (() => []);
    this.meshList = param.meshList;
    // 设置状态
    this.setStatusDown = param.setStatusDown || (() => true);
    this.setStatusUp = param.setStatusUp || (() => true);

    // 初始化射线
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // three的容器, 场景, 相机, 控制器
    this.container = _three.container;
    this.camera = _three.camera;
    this.controls = _three.controls;

    // 监听事件
    this.addEventObj.onMousedown = this.onMousedown.bind(this);
    this.addEventObj.onMouseMove = this.onMouseMove.bind(this);
    this.addEventObj.onMouseUp = this.onMouseUp.bind(this);
    this.container.addEventListener('mousedown', this.addEventObj.onMousedown);
    this.container.addEventListener('mousemove', this.addEventObj.onMouseMove);
    this.container.addEventListener('mouseup', this.addEventObj.onMouseUp);
  }

  destroy() {
    this.container.removeEventListener('mousedown', this.addEventObj.onMousedown);
    this.container.removeEventListener('mousemove', this.addEventObj.onMouseMove);
    this.container.removeEventListener('mouseup', this.addEventObj.onMouseUp);

    this.raycaster = null;
    this.mouse = null;
    this.activeMesh = null;
  }

  /**
   * 鼠标按下
   * @param {MouseEvent} evt 鼠标事件
   * */
  onMousedown(evt) {
    evt.preventDefault();

    // 数遍按下选中的mesh
    const { uv, object, intersect } = this.raycasterFn(evt, false);

    // 鼠标按下前
    if (!this.beforeMouseDown(uv, object, evt)) return;

    // 设置状态
    this.setStatus('down');

    // 射线交互
    this.raycasterFn(evt);

    // 鼠标按下后
    this.afterMouseDown(uv, object);
  }

  /**
   * 鼠标移动
   * @param {MouseEvent} evt 鼠标事件
   * */
  onMouseMove(evt) {
    evt.preventDefault();
    // 鼠标没有按下, 不触发射线交互
    if (!this.beforeMouseMove()) return;

    // 射线交互
    this.raycasterFn(evt);

    // 鼠标移动后
    this.afterMouseMove();
  }

  /**
   * 鼠标弹起
   * @param {MouseEvent} evt 鼠标事件
   * */
  onMouseUp(evt) {
    evt?.preventDefault();

    // 设置状态
    this.setStatus('up');

    // 鼠标抬起前
    if (!this.beforeMouseUp()) return;

    // 射线交互
    const { object } = this.raycasterFn(evt);

    // 鼠标抬起后
    this.afterMouseUp(object, evt);
  }

  /**
   * 设置状态
   * @param {string} type down | up
   */
  setStatus(type = 'down') {
    switch (type) {
      // 鼠标按下
      case 'down':
        this.setStatusDown();
        this.isDown = true; // 容器内鼠标按下
        this.controls.enabled = false; // 禁用控制器
        break;
      // 鼠标弹起
      case 'up':
        this.setStatusUp();
        this.isDown = false; // 容器内鼠标弹起
        this.controls.enabled = true; // 启用控制器
        this.activeMesh = null; // 清空射线缓存的mesh
        break;
      default:
        throw new Error('setStatus type error');
    }
  }

  /**
   * 射线交互
   * @param {MouseEvent} evt 鼠标事件
   * @param {boolean} flag 是否设置鼠标位置
   * */
  raycasterFn(evt, flag = true) {
    // 交互的模型
    const objects = this.activeMesh || this.meshList;

    // 获取交叉点, 有值并且存在uv就是射线与模型相交
    const intersect = this.getIntersects(evt, objects)[0];
    // console.log('射线交互 交互的模型 objects', objects);
    // console.log('射线交互 交互的模型 this.activeMesh', this.activeMesh);
    // console.log('射线交互 交互的模型 this.meshList', this.meshList);
    // console.log('射线交互 交互的模型 intersect', intersect);

    // 射中的mesh如果有贴图就触发交互
    if (intersect?.uv) {
      this.setInteraction(intersect, evt, flag);
    }

    return { intersect, uv: intersect?.uv, object: intersect?.object };
  }

  /**
   * 交互
   * @param {Object} intersect {uv,object,point}
   * @param {MouseEvent} event 鼠标事件
   * @param {boolean} flag 是否设置鼠标位置
   * */
  setInteraction(intersect, event, flag = true) {
    if (!intersect.object.material.map) return;

    const uv = intersect.uv; // uv坐标
    const materialName = intersect.object.material.name; // 材质名称

    // 缓存当前选中的mesh
    if (!this.activeMesh) this.activeMesh = [intersect.object];

    // uv坐标转换(uv矫正, 有些贴图uv坐标不是从0-1, 会导致绘制位置不正确)
    intersect.object.material.map.transformUv(intersect.uv);

    // 设置鼠标位置,并渲染
    flag && this.setPos(materialName, uv, event);
  }

  /**
   * 设置鼠标位置
   * @param {HTMLElement} container 容器
   * @param {MouseEvent} event 鼠标事件
   * */
  setMousePosition(container, event) {
    const dom = container.querySelector('canvas');
    const getBoundingClientRect = dom.getBoundingClientRect();
    const x = (event.clientX - getBoundingClientRect.left) / dom.offsetWidth;
    const y = (event.clientY - getBoundingClientRect.top) / dom.offsetHeight;
    this.mouse.x = x * 2 - 1;
    this.mouse.y = -y * 2 + 1;
  }

  /**
   * 获取交叉点
   * @param {MouseEvent} event 鼠标事件
   * @param {Array} objects 交互的模型
   * @returns {Array} 交叉点
   * */
  getIntersects(event, objects) {
    this.setMousePosition(this.container, event); // 设置鼠标位置
    this.raycaster.setFromCamera(this.mouse, this.camera); // 设置射线
    return this.raycaster.intersectObjects(objects, false); // 获取交叉点 false=不穿透子对象
  }
}
