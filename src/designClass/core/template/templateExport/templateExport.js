import { GRequest, METHOD } from '@/utils/request';
import { TemplateCamera3d } from '@/designClass/core/template/templateCamera3d';

/**
 * 模板导出按钮的配置
 */
export class TemplateExport {
  /**@type {DesignerApp} 设计器*/
  $app;

  /**@type {Template} 模板*/
  $template;

  /**@type {boolean} 加载*/
  loading = false;

  /**@type {templateExportConfig[]} 导出按钮的配置*/
  configList = [];

  /**@type {boolean} 是否请求过*/
  isRequest = false;

  constructor($app, $template) {
    this.$app = $app;
    this.$template = $template;
  }

  /**
   * 调用接口获取配置
   */
  async getConfigApi() {
    this.isRequest = true;
    this.loading = true;
    try {
      // 如果可以加载,请求接口,是否配置 导出模型截图
      const size = this.$template.size || '';
      const res2 = await GRequest(`/base-web/template3d/cmProductTemplate3dAngle/query3dAngleConfig`, METHOD.POST, {
        templateId: this.$template.detail.seqId,
        size: size,
      });
      if (res2.data.code !== 0) return;
      if (res2.data.data.length !== 0) {
        // 过滤出未禁用数据
        this.configList = res2.data.data.filter((e) => {
          e.templateCamera3d = new TemplateCamera3d(this.$app, this.$template);
          return e.useflag === 0;
        });
      }
    } finally {
      this.loading = false;
    }
  }
}
