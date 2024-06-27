/**
 * 渲染多角度item
 * @typedef {object} RenderMulti
 * @prop {string} multiId 排序id
 * @prop {string} composeId 多角度id
 * @prop {string} id 多角度id
 * @prop {string} bgImg 背景图
 * @prop {string|null} prodImg 产品图
 * @prop {string|null} designImg 渲染图
 * @prop {MultiItem} multiItem 多角度item
 * @prop {string} glb 3d模型路径 - 有值则为3d
 * @prop {string} glbContainerId 3d模型的容器id - 有值则为3d
 * @prop {boolean} loading 3d - 有值则为3d
 * @prop {TemplateCamera3d} templateCamera3d 3d - 有值则为3d
 */
/**
 * 多角度item
 * @typedef {object} MultiItem
 * @prop {string} image 模板图
 * @prop {string} texture 纹理图
 * @prop {string} mask 蒙版图
 * @prop {number} sortno 排序
 * @prop {string} viewId 视图id
 * @prop {string} multiId 多角度id
 * @prop {string} composeId 复杂多角度id
 * @prop {array} parts 点位
 * @prop {string} sortId 排序id
 // * @prop {string} backgroundImage
 // * @prop {string} isMirror
 // * @prop {string} color
 // * @prop {string} frontImage
 // * @prop {string} svg
 // * @prop {string} svgCode
 // * @prop {string} isMain
 // * @prop {string} groupId
 // * @prop {string} template_number_with_size_code
 // * @prop {string} sortId
 // * @prop {array} parts
 */

/**
 * 颜色item
 * @typedef {object} Appearance
 * @prop {string} id 颜色id
 * @prop {string} name 颜色名称
 * @prop {array} views 视图对应的颜色图片
 * @prop {MultiItem[]} multiAngleImages 简单多角度图
 * @prop {MultiItem[]} multiAngleImages4Compose 复杂多角度图
 */

/**
 * 多角度3d
 * @typedef multi3dItem
 * @prop {string} size 尺码 - 通用为空,精细为指定尺码
 * @prop {string} glbPath 模型路径
 * @prop {string} seqId 主键
 * @prop {number} useflag 是否启用 - 1-启用 0-不启用
 * @prop {string} templateNo 模板号
 * @prop {string} templateId 模板id
 * @prop {string} angleName 多角度名称
 * @prop {number} sortno 排序号
 // * @prop {number} configType
 // * @prop {string} zipPath
 // * @prop {string} updateUser
 // * @prop {string} updateTime
 // * @prop {object} createTime
 // * @prop {string} versionNo
 // * @prop {string} createUser
 */

/**
 * 模板详情
 * @typedef {object} TemplateDetail 模板详情
 * @prop {string} seqId 模板主键
 * @prop {array} views 视图列表
 * @prop {Appearance[]} appearances 颜色列表
 * @prop {multi3dItem[]} 3dAngleList 多角度3d列表
 * @prop {array} printAreas 印刷区域
 * @prop {array} pointoutPrintAreas 印花区域
 * @prop {array} sizes 尺码列表
 * @prop {array} templateImages 模板图片
 * @prop {string} name 模板名称
 * @prop {number} dpi dpi
 * @prop {string} templateNo 模板编号
 * @prop {string} templateType 模板类型
 * @prop {string} id 模板id
 * @prop {number} isHotStamping 是否烫印
 * @prop {string} emptyCopy 是否对面设计
 * @prop {boolean} isCanSynthesis 是否能全颜色合成
 */

/**
 * 设计项 (设计图|文字|背景图|背景色)
 * @typedef {ImageDesign|BackgroundImageDesign|BackgroundColorDesign|TextDesign|DesignHandle} DesignItem 设计项 (设计图|文字|背景图|背景色)
 * */

/**
 * @typedef {object} DesignNode 设计节点
 * @extends Konva.Node
 * @prop {DESIGN_TYPE} attrs.type 设计类型
 * @prop {DesignItem} attrs.$design 设计类
 * @prop {object} attrs.inch 英寸尺码
 */

/**
 * 保存|渲染-接口入参
 * @typedef SubmitParamDesigner
 * @prop {configuration[]} configurations 设计列表
 * @prop {{id:string}} appearance 颜色
 * @prop {defaultView:{id:string}}} defaultValues 视图
 * @prop {{id:TEMPLATE_TYPE}} productType 产品类型
 * @prop {SUBMIT_TYPE_SAVE_NUM_BTN} saveNumBtn 保存类型 0:保存产品 1:全颜色合成 2:原胚设计
 * @prop {TEMPLATE_TYPE} templateType //模板类型 0:自产 1:外采
 * @prop {string} static_batchid //批量设计id
 * @prop {string} adminImage 是否有管理图库参与 ''-无 1-有
 * @prop {SUBMIT_TYPE_IS_USE_MIRROR} isUseMirror 镜像设计 0-否 1-是
 * @prop {SUBMIT_TYPE_IS_NEED_COPY} isNeedCopy 空拷贝 0-否 1-是
 * @prop {object} fullSvg 没用到
 * @prop {string} creator 固定值 Tablomat8
 * @prop {{freeColorSelection:false,example:false}} restrictions 没有用到 固定值
 */

/**
 * 设计
 * @typedef configuration
 * @prop {string} type 类型 design|backgroundColor
 * @prop {boolean} isText 是否文字
 * @prop {{x:number,y:number}} offset x,y坐标
 * @prop {id:string} printArea 视图id
 * @prop {{svg:object|string}} context 内容 - 图|颜色
 */

/**
 * 更新材质方法入参
 * @typedef updateMeshOpt
 * @prop {boolean} [multi=true] 是否更新多角度的3d
 */

/**
 * 模板导出的配置
 * @typedef templateExportConfig
 * @prop {string} seqId - "1800447527653220356",
 * @prop {string} templateId - "b0de7c70-6dac-4c1f-99d3-ceaeebe8478b",
 * @prop {string} templateNo - "2267",
 * @prop {string} angleName - "2267-positive",
 * @prop {string} zipPath - "/fnplatformfiles/template_3d_angle/2267_202406111638338780/2267.zip",
 * @prop {string} glbPath - "/fnplatformfiles/template_3d_angle/2267_202406111638338780/2267-positive.glb",
 * @prop {number} configType - 0,
 * @prop {string} size - null,
 * @prop {number} useflag - 0, (0-未禁用,1-已禁用)
 * @prop {number} sortno - 1,
 * @prop {TemplateCamera3d} templateCamera3d - 3d,
 // * @prop {string} versionNo: "1"
 // * @prop {string} updateUser: null,
 // * @prop {string} updateTime: "2024-06-11 08:39:19",
 // * @prop {string} createUser: "de5f04fe-df6c-4fba-b463-53291d7e6dcf_11",
 // * @prop {string} createTime: "2024-06-11 16:38:36",
 */

/**
 * 设计信息
 * @typedef DesignInfo
 * @prop {x:number,y:number,rotation:number,scaleX:number,scaleY:number,visible:boolean} attrs 设计基础参数
 * @prop {ImageDetail} detail 设计图详情
 * @prop {TextParam} param 文字参数
 * @prop {string} colorCode 背景色
 * @prop {gapX:number,gapY:number,offset:number,offsetType:TILE_TYPE_OFFSET,mirrorType:TILE_TYPE_MIRROR} tile 平铺参数
 * @prop {boolean} isTile 是否平铺
 * @prop {DESIGN_TYPE} type 设计类型
 */

/**
 * 视图信息
 * @typedef ViewInfo
 * @prop {string} id 视图id
 * @prop {DesignInfo[]} designInfoList 设计列表
 */

/**
 * 模板休眠数据
 * @typedef templateDormancyData
 * @prop {ViewInfo[]} viewInfoList 视图信息列表
 */

/**
 * @typedef Config3dViewItem
 * @prop {string} seqId "1800443745741578241",
 * @prop {string} templateId "78c648bf-5ab5-4ab9-9532-5eb38771de55",
 * @prop {string} templateNo "2435",
 * @prop {string} viewId 2,
 * @prop {string} viewRelation null,
 * @prop {string} viewName "2",
 * @prop {string} materialName "front_right",
 * @prop {string} uvD "1",
 * @prop {string} uvV "1",
 * @prop {string} useflag 0,
 * @prop {string} sortNo 1,
 * @prop {string} createUser null,
 * @prop {string} createTime null,
 * @prop {string} updateUser "de5f04fe-df6c-4fba-b463-53291d7e6dcf_11",
 * @prop {string} updateTime null,
 * @prop {string} cameraPosition "{\"x\":14.972237904780949,\"y\":1.7468047329411809,\"z\":0.17540053481894813}",
 * @prop {string} cameraRotation "{\"roughness\":0.8,\"focal\":200}",
 * @prop {string} configType 0,
 * @prop {string} size null
 */
