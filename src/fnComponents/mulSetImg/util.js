/*
 * 设计图上传需要的参数
 * @param {object} file 文件
 * */
export function dispose_designParam(file, cut1500Flag) {
  let form = new FormData();
  let param = {
    id: file.uid,
    name: file.label, //label-去掉后缀的名称 name-没有去掉后缀
    type: file.raw.type,
    lastModifiedDate: file.raw.lastModifiedDate,
    size: file.size,
    file: file.raw,
    cut1500Flag,
  };
  for (let key in param) {
    form.append(key, param[key]);
  }
  return form;
}
