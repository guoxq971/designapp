import { nextTick } from 'vue';
import { ThreeWithCamera } from '@/designClass/core/template/ThreeWithCamera';
import * as THREE from 'three';
import { GRequest, METHOD } from '@/utils/request';
import { getUuid } from '@/utils/fnUtils';
import moment from 'moment/moment';

/**
 * 携带相机的3d模板
 */
export class TemplateCamera3d {
  /**@type {DesignerApp} 设计器*/
  $app;
  /**@type {Template} 模板*/
  $template;
  /**@type {ThreeWithCamera} three相关 (相机，场景...)*/
  three;
  /**@type {boolean} loading*/
  loading = false;
  /**@type {THREE.Mesh[]} 需要更新的材质列表*/
  updateMeshList = [];

  /**
   * @constructor
   * @param $app
   * @param $template
   */
  constructor($app, $template) {
    this.$app = $app;
    this.$template = $template;
  }

  /**
   * 创建3d
   * @param {HTMLElement} container 容器
   * @param {string} path 模型路径
   * @param {function} [successBack=()=>{}] 成功回调
   */
  create3d(container, path, successBack = () => {}) {
    if (this.three) {
      successBack && successBack();
      return;
    }
    this.three = new ThreeWithCamera();
    this.three.create({
      path: process.env.VUE_APP_API_BASE_IMG_URL + path,
      container,
      loadModelBefore: () => {
        this.loading = true;
      },
      loadModelFinally: () => {
        this.loading = false;
      },
      loadModelSuccess: (model, meshModelList, three) => {
        nextTick(() => {
          this.bindCanvas(meshModelList);
          successBack && successBack();
        });
      },
    });
  }

  /**
   * 绑定材质
   * @private
   * @param {THREE.Mesh[]} meshModelList
   */
  bindCanvas(meshModelList) {
    this.updateMeshList = [];
    this.$template.template3d.meshList.forEach((item) => {
      const mesh = meshModelList.find((e) => e.name === item.mesh.name);
      if (mesh) {
        mesh.material.map?.dispose();
        mesh.material.map = item.mesh.material.map.clone();
        mesh.material.needsUpdate = true;
        this.updateMeshList.push(mesh);
        this.three.renderer.render(this.three.scene, this.three.camera);
        // console.log('绑定材质', mesh.name, this);
      }
    });
  }

  /**
   * 更新材质
   */
  updateMesh() {
    if (this.three?.scene && this.three?.camera && this.three?.renderer) {
      this.updateMeshList.forEach((mesh) => (mesh.material.map.needsUpdate = true));
      this.three.renderer.render(this.three.scene, this.three.camera);
      // console.log('更新成功');
    }
  }

  /**
   * 销毁
   */
  destroy() {
    this.updateMeshList.forEach((mesh) => {
      mesh.material.map?.dispose();
      mesh.material.map = null;
      mesh = null;
    });
    this.updateMeshList = [];
    this.three?.destroy();
    this.three = null;
  }

  /**
   * 截图模型设计,从头开始
   * @param {HTMLElement} container
   * @param {string} path
   * @returns {Promise<{base64: string, destroy: function}>}
   */
  getNewBase64(container, path) {
    return new Promise((resolve) => {
      const three = new ThreeWithCamera();
      three.create({
        path: process.env.VUE_APP_API_BASE_IMG_URL + path,
        container,
        loadModelBefore: () => {
          // this.loading = true;
        },
        loadModelFinally: () => {
          // this.loading = false;
        },
        loadModelSuccess: (model, meshModelList, three) => {
          nextTick(() => {
            // 绑定材质
            this.$template.template3d.meshList.forEach((item) => {
              const mesh = meshModelList.find((e) => e.name === item.mesh.name);
              if (mesh) {
                mesh.material.map?.dispose();
                mesh.material.map = item.mesh.material.map.clone();
                mesh.material.needsUpdate = true;
                three.renderer.render(three.scene, three.camera);
                // console.log('绑定材质', mesh.name, this);
              }
            });
            // 渲染一次
            three.renderer.render(three.scene, three.camera);
            // 截图
            const base64 = three.renderer.domElement.toDataURL();
            // 销毁three
            three.destroy();
            // 返回
            resolve({ base64 });
          });
        },
      });
    });
  }

  /**
   * 上传模型设计,获取设计id
   * @param {string} path
   * @param {number} [size=1500] 尺寸
   * @returns {Promise<string>} 设计id
   */
  getDesignIdByNew(path, size = 1500) {
    // 创建容器
    const id = 'save_product' + getUuid();
    const container = document.createElement('div');
    container.id = id;
    container.style.width = `${size}px`;
    container.style.height = `${size}px`;
    container.style.position = 'fixed';
    container.style.left = '9999999px';
    document.body.appendChild(container);

    // 截图
    return this.getNewBase64(container, path).then(({ base64 }) => {
      // 移除容器
      document.body.removeChild(container);

      // base64 转 formData
      const fd = base64ToFormData(base64);

      // 上传获取id
      return GRequest(`/base-web/cm/cmDesignImage3d/ajaxBatchUploadDesign.act`, METHOD.POST, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => {
        if (res.data.retState === '0') {
          // 销毁base64
          URL.revokeObjectURL(base64);
          // 返回设计id
          return res.data.designId;
        }
        return '';
      });
    });
  }
}

/**
 * base64转formData
 * @param base64
 * @returns {FormData}
 */
function base64ToFormData(base64) {
  // base64 转file
  const file = base64ToFile(base64, `fn-${getUuid()}.jpg`);
  file.uid = moment()
    .valueOf()
    .toString()
    .substr(0, 12);
  file.label = file.name.split('.')[0];
  file.raw = new window.File([file], file.name, { type: file.type });
  file.isCopyRightGrade = '0'; //侵权
  file.isFuGrade = '2'; //全幅
  file.newBasetype = '0'; //图片一级分类

  // formData
  const fd = new FormData();
  const param = {
    id: file.uid,
    name: file.name, //file.label-去掉后缀的名称 file.name-没有去掉后缀
    type: file.raw.type,
    lastModifiedDate: file.raw.lastModifiedDate,
    size: file.size,
    file: file.raw,
    cut1500Flag: '',
  };
  for (let key in param) {
    fd.append(key, param[key]);
  }

  return fd;
}

/**
 * base64转file
 */
function base64ToFile(base64, filename) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
