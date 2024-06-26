import { onMounted, ref } from 'vue';
import { GRequest, METHOD } from '@/utils/request';
import { EXCLUSIVE_LABEL, EXCLUSIVE_VALUE } from '@/fnDesigner/config/common';
import { getLocalUserInfo } from '@/utils/fnUtils';

export function useGetAccountList(opt) {
  opt = Object.assign(
    {
      //
      isMountedSend: true,
      params: { value: { customerId: '' } },
    },
    opt,
  );

  const list = ref([]);
  const loading = ref(false);
  const api = () => {
    loading.value = true;
    return GRequest(`/base-web/YZAccountAct/getAccountList4Designer`, METHOD.POST)
      .then((res) => {
        if (res.data.code !== 0) return;
        res.data.data = res.data.data
          .filter((e) => e.id !== '')
          .map((item) => {
            return {
              label: item.name,
              value: item.id,
              right: item.userName,
            };
          });
        res.data.data.unshift({ label: EXCLUSIVE_LABEL, value: EXCLUSIVE_VALUE, right: '' });
        res.data.data.unshift({ label: '全部图片来源', value: '', right: '' });
        // 获取本地用户信息,默认选中自己的账号
        const user = getLocalUserInfo();
        const d = res.data.data.find((e) => e.value === user?.accountSeqId);
        if (d) {
          opt.params.value.customerId = d.value;
        }
        res.data.data.forEach((e) => {
          const right = e.right ? `(${e.right})` : '';
          e.label = `${e.label}${right}`;
        });
        list.value = res.data.data;
      })
      .finally(() => {
        loading.value = false;
      });
  };

  onMounted(() => {
    api();
  });

  return {
    list,
    loading,
    getList: api,
  };
}
