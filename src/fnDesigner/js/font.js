/**
 * 检测字体文件是否已加载
 * @param name
 * @returns {boolean}
 */
export function checkFont(name) {
  name = 'bm' + name;
  const values = document.fonts.values();
  let isHave = false;
  let item = values.next();
  while (!item.done && !isHave) {
    let fontFace = item.value;
    if (fontFace.family == name) {
      isHave = true;
    }
    item = values.next();
  }
  return isHave;
}

/**
 * 加载字体
 * @param {{name:string, url:string, state:number}} font
 */
export function loadFont(font) {
  const fontName = 'bm' + font.name;
  if (checkFont(fontName)) {
    // 字体已加载过，无需再次加载
    // console.log(`字体: ${fontName} 已加载过，无需再次加载.`);
    font.state = 2;
    return;
  }
  // 请求中
  font.state = 1;

  // const fontFace = new FontFace(fontName, `url(${font.url}) format('truetype')`);
  const fontFace = new FontFace(fontName, `url(${font.url})`);

  // 加载字体
  fontFace
    .load()
    .then((loadedFont) => {
      // 字体加载成功
      font.state = 2;
      document.fonts.add(loadedFont);
      // console.log(`字体: ${fontName} 加载成功.`);
    })
    .catch((error) => {
      // 字体加载失败
      font.state = 3;
      console.error(`字体: ${fontName} 加载失败. 失败原因: ${error}`);
    });
}
