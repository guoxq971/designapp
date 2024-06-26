import { ref } from 'vue';
import { GRequest, METHOD } from '@/utils/request';
import { cloneDeep } from 'lodash';

/**
 * 模板价格
 */
export function useGetTemplatePrice() {
  // loading
  const loading = ref(false);
  // 列表
  const list = ref([]);
  // 是否设置特殊价格(2-没有 0-尺寸设置 1-颜色设置)
  const specialType = ref('');

  // 获取模板价格列表
  function getList(templateNo) {
    loading.value = true;
    return GRequest(`/base-web/CMDesignerAct/listTemplatePrice`, METHOD.GET, { templateNo })
      .then((res) => {
        if (res.data.code !== 0) return;
        // console.log('模板价格列表', res);
        // 模板价格返回为空
        if (Object.keys(res.data.data).length === 0) {
          specialType.value = '';
          list.value = [];
          return;
        }
        // console.log('根据模板号获取价格列表', res.data.data);
        specialType.value = res.data.data.templateType;
        list.value = res.data.data.resList.map((e) => {
          return {
            prop: e.templateProperty,
            list: e.priceList, //{price,num}
          };
        });
        // console.log('模板价格', cloneDeep(list.value));
      })
      .finally(() => {
        loading.value = false;
      });
  }

  return {
    loading,
    list,
    getList,
    specialType,
  };
}
