import { nextTick } from 'vue';
import { ThreeWithCamera } from '@/designClass/core/template/ThreeWithCamera';
import * as THREE from 'three';

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
}
