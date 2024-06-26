<template>
  <el-dialog :title="title" :close-on-click-modal="false" width="500px" top="15vh" append-to-body @close="onClose" visible>
    <div>
      <el-select v-model="activeSize" :disabled="loading">
        <el-option v-for="item in sizeList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button style="margin-left: 15px;" type="primary" @click="onSubmit" :loading="loading">确定</el-button>
    </div>

    <div class="preview-group" v-if="imageList.length">
      <div v-loading="item.templateCamera3d.loading" v-for="(item, index) in $app.activeTemplate.templateExport.configList" :key="'preview_' + index">
        <img :src="showImage(item)" alt="" class="img" />
      </div>
    </div>

    <div class="template-export-container-group">
      <div ref="templateExportRef" v-for="(item, index) in $app.activeTemplate.templateExport.configList" :key="'template_export_container3d_' + index" :style="containerStyle"></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { Ref, computed, defineEmits, defineProps, onBeforeUnmount, ref } from 'vue';
import { designStoreToRefs } from '@/designClass/store';
import JSZip from 'jszip';

const title = '模板导出';
const emit = defineEmits(['update:show', 'success']);
const onClose = () => emit('update:show', false);
const props = defineProps({
  // 开关
  show: { type: Boolean, default: false },
});

const $app = designStoreToRefs();

onBeforeUnmount(() => {
  // 3d销毁
  $app.value.activeTemplate.templateExport.configList.forEach((item) => item.templateCamera3d.destroy());
  // base64销毁
  imageList.value.forEach((item) => URL.revokeObjectURL(item.base64));
});

const showImage = computed(() => {
  return (item) => imageList.value.find((e) => e.seqId === item.seqId)?.base64;
});
/**@type {Ref<{name:string,base64:string,seqId:string}[]>}*/
const imageList = ref([]);
const templateExportRef = ref(null);
const loading = ref(false);
const sizeList = [
  { label: '1500 x 1500 px', value: 1, size: 1500 },
  { label: '1000 x 1000 px', value: 2, size: 1000 },
  { label: '500 x 500 px', value: 3, size: 500 },
];
const activeSize = ref(sizeList[0].value);
const activeSizeObj = computed(() => sizeList.find((item) => item.value === activeSize.value));
const containerStyle = computed(() => ({
  width: `${activeSizeObj.value.size}px`,
  height: `${activeSizeObj.value.size}px`,
}));

// 提交
function onSubmit() {
  loading.value = true;
  // base64销毁
  imageList.value.forEach((item) => URL.revokeObjectURL(item.base64));
  imageList.value = [];
  const configList = $app.value.activeTemplate.templateExport.configList;
  configList.forEach((item, index) => {
    item.templateCamera3d.create3d(
      templateExportRef.value[index],
      item.glbPath,
      // 成功的回调
      () => {
        item.templateCamera3d.updateMesh();
        setTimeout(() => {
          imageList.value.push({
            seqId: item.seqId,
            base64: item.templateCamera3d.three.exportBase64(),
            name: item.angleName,
          });
          // 全部成功
          if (imageList.value.length === configList.length) {
            createZip();
          }
        });
      },
    );
  });
}

function createZip() {
  // 创建一个 JSZip 实例
  const zip = new JSZip();
  // 将所有图片添加到 ZIP 文件
  imageList.value.forEach((item) => {
    zip.file(`${item.name}.png`, item.base64.split('base64,')[1], { base64: true });
  });

  // 生成 ZIP 文件
  zip
    .generateAsync({ type: 'blob' })
    .then((zipBlob) => {
      // 创建一个下载链接
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      // name = 3D效果图_时间戳.zip
      downloadLink.download = `3D效果图_${new Date().getTime()}.zip`;

      // 将链接添加到页面并触发下载
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // 移除链接
      document.body.removeChild(downloadLink);
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style scoped lang="less">
.template-export-container-group {
  position: fixed;
  left: 99999999999px;
}
.preview-group {
  width: 43.3rem;
  display: flex;
  flex-wrap: wrap;
  margin-top: 1.2rem;
  img {
    width: 10rem;
    height: 10rem;
    border: 1px solid #eee;
    margin-right: 0.8rem;
    margin-bottom: 0.8rem;
  }
}
</style>
