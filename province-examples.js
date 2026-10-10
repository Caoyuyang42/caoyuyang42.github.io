/* Province case studies. Remote images stay at the original URL; nothing is downloaded.
 * Schema: province id => {name, cases:[{id,location,title,type,analysis,images:[
 * {url,alt,sourceUrl,sourceName,sourceKind,verifiedSource,credit,fallbackUrl?}
 * ]}]}. verifiedSource means the image/project association was checked in its source
 * article, not that the website has granted a reuse licence.
 */
(() => {
  const search = (query, alt) => ({
    url: 'https://tse1.mm.bing.net/th?q=' + encodeURIComponent(query) + '&w=2400&h=1600&c=7&rs=1',
    alt,
    sourceUrl: 'https://www.bing.com/images/search?q=' + encodeURIComponent(query),
    sourceName: 'Bing 图片检索',
    sourceKind: 'search-preview',
    verifiedSource: false,
    credit: '检索预览；以原网页图片说明为准'
  });
  window.ATLAS_PROVINCE_EXAMPLES = {
    '630000': {name:'青海',cases:[
      {id:'qinghai-talatan',location:'海南藏族自治州 · 共和县',title:'塔拉滩光伏产业园',type:'高原集中式 · 牧光互补',
        analysis:'高原连片阵列呈现集中式开发的空间尺度；来源报道同时介绍板下植被恢复与牧业利用，可结合土地覆盖与碳汇指标理解土地复合利用。',
        images:[
          {url:'https://kjj.hainanzhou.gov.cn/upload/kjj/contentmanage/article/image/2025/07/23/5b5aefb9d2a043a3bc687b3d5d3b58c4.jpeg',alt:'青海共和县塔拉滩光伏产业园航拍',sourceUrl:'https://kjj.hainanzhou.gov.cn/lnb/kjcx1__kjcx/content_1013649358',sourceName:'海南藏族自治州科学技术局 / 中国新闻网',sourceKind:'source-photo',verifiedSource:true,credit:'徐景康 摄 · 2025-07-23 来源报道'},
          {url:'https://kjj.hainanzhou.gov.cn/upload/kjj/contentmanage/article/image/2025/07/23/84ecbf603c9d4ada9dfbf1688d2a10a5.jpeg',alt:'青海共和县塔拉滩光伏产业园另一幅航拍',sourceUrl:'https://kjj.hainanzhou.gov.cn/lnb/kjcx1__kjcx/content_1013649358',sourceName:'海南藏族自治州科学技术局 / 中国新闻网',sourceKind:'source-photo',verifiedSource:true,credit:'徐景康 摄 · 2025-07-23 来源报道'}
        ]},
      {id:'qinghai-golmud',location:'海西蒙古族藏族自治州 · 格尔木市',title:'荒漠光伏产业园',type:'戈壁集中式',
        analysis:'关注戈壁、远山、组件阵列与输电设施的空间关系，结合太阳辐射与承载基础讨论大基地布局。照片不能单独证明外送能力。',images:[search('青海格尔木 荒漠 光伏电站 航拍','格尔木荒漠光伏检索预览')]}
    ]},
    '150000': {name:'内蒙古',cases:[
      {id:'inner-mongolia-dalat',location:'鄂尔多斯市 · 达拉特旗',title:'达拉特旗光伏发电应用领跑基地',type:'沙漠集中式 · 光伏治沙',
        analysis:'组件阵列与沙地治理共同出现，展示发电与固沙相结合的场景。可结合不可用土地占比与生态约束理解土地复合利用，不将项目治沙效果直接外推至全旗。',
        images:[{url:'https://www.nea.gov.cn/2019-12/27/138661352_15774274043721n.jpg',alt:'达拉特旗光伏发电应用领跑基地一期500兆瓦项目',sourceUrl:'https://www.nea.gov.cn/2019-12/27/c_138661352.htm',sourceName:'国家能源局 / 经济日报',sourceKind:'source-photo',verifiedSource:true,credit:'王轶辰 摄 · 2019-12-27 来源报道',fallbackUrl:search('内蒙古达拉特旗 光伏治沙 航拍','达拉特旗光伏治沙检索预览').url}]}
    ]},
    '340000': {name:'安徽',cases:[
      {id:'anhui-panji',location:'淮南市 · 潘集区',title:'采煤沉陷区水面光伏',type:'水面漂浮式 · 受损土地再利用',
        analysis:'关注漂浮组件、水面和沉陷区岸线的组合，理解采煤沉陷区再利用与地面光伏的用地差异。水面存在不等于全县可建设。',images:[search('淮南潘集 水面光伏 航拍','潘集区采煤沉陷区水面光伏检索预览')]}
    ]},
    '320000': {name:'江苏',cases:[
      {id:'jiangsu-huaian',location:'淮安市',title:'渔光互补',type:'水面资源复合利用',
        analysis:'观察水面、养殖空间与光伏组件的关系，体现水面资源与农业生产复合利用的空间形态。',images:[search('江苏淮安 渔光互补 航拍','淮安渔光互补检索预览')]},
      {id:'jiangsu-yangzhong',location:'镇江市 · 扬中市',title:'工商业屋顶光伏',type:'屋顶分布式 · 就地用电',
        analysis:'厂房屋顶上的组件与建筑密度体现分布式开发形态，可与西北集中式地面电站比较；照片不能代替实际负荷或电网容量。',images:[search('江苏扬中 工业厂房 屋顶 光伏','扬中工商业屋顶光伏检索预览')]}
    ]},
    '330000': {name:'浙江',cases:[
      {id:'zhejiang-jiaxing',location:'嘉兴市',title:'户用屋顶光伏',type:'屋顶分布式',
        analysis:'观察住宅屋顶与光伏阵列的叠合，理解在已有建筑上利用空间的分布式开发形态。',images:[search('浙江嘉兴 屋顶光伏 实景','嘉兴屋顶光伏检索预览')]},
      {id:'zhejiang-cixi',location:'宁波市 · 慈溪市',title:'滩涂与围垦地光伏',type:'沿海用地 · 生态边界',
        analysis:'关注滩涂、围垦地、海岸工程与阵列的关系，结合土地覆盖与保护区边界讨论生态约束。',images:[search('浙江慈溪 滩涂 光伏 实景','慈溪滩涂光伏检索预览')]}
    ]},
    '520000': {name:'贵州',cases:[
      {id:'guizhou-guanling',location:'安顺市 · 关岭布依族苗族自治县',title:'山地光伏',type:'山地坡面布置',
        analysis:'起伏山地与沿坡阵列体现地形对组件布置和施工的影响。辐射条件需由长期数据判断，照片中的云不能代表全年日照。',images:[search('贵州关岭 山地光伏 实景','关岭山地光伏检索预览')]}
    ]},
    '530000': {name:'云南',cases:[
      {id:'yunnan-yuanmou',location:'楚雄彝族自治州 · 元谋县',title:'物茂光伏项目',type:'干热河谷场景',
        analysis:'观察干热河谷中的地表形态与光伏布置，结合辐射、坡度和土地约束进行地域对照。',images:[search('云南元谋 物茂 光伏项目 干热河谷 航拍','元谋物茂光伏项目检索预览')]}
    ]},
    '440000': {name:'广东',cases:[
      {id:'guangdong-shenzhen',location:'深圳市',title:'工业园屋顶光伏',type:'城市工商业分布式',
        analysis:'屋顶组件与密集工业建筑体现高负荷、土地紧张地区的空间利用方式。项目案例与县域承载基础可相互参照。',images:[search('深圳 工业园 屋顶光伏 实景','深圳工业园屋顶光伏检索预览')]}
    ]},
    '540000': {name:'西藏',cases:[
      {id:'tibet-shigatse',location:'日喀则市',title:'光伏储能场景',type:'光储结合',
        analysis:'关注高原光伏与配套设施的场景。储能规模、运行效果及电网接入条件须依据项目资料，不能从外观推算。',images:[search('西藏日喀则 光伏储能 实景','日喀则光伏储能检索预览')]}
    ]},
    '650000': {name:'新疆',cases:[
      {id:'xinjiang-hami',location:'哈密市',title:'沙漠光伏',type:'干旱区集中式',
        analysis:'观察沙漠地表与连片阵列，结合辐射和土地约束理解集中式开发形态。',images:[search('新疆哈密 沙漠光伏 航拍','哈密沙漠光伏检索预览')]},
      {id:'xinjiang-ruoqiang',location:'巴音郭楞蒙古自治州 · 若羌县',title:'干旱区沙漠光伏',type:'大尺度集中式',
        analysis:'开阔地表、运维道路与连片阵列适合讨论空间广阔与实际开发约束的差别。地表面积不能直接等同于可开发面积。',images:[search('新疆若羌 沙漠光伏 航拍','若羌沙漠光伏检索预览')]}
    ]},
    '620000': {name:'甘肃',cases:[
      {id:'gansu-dunhuang',location:'酒泉市 · 敦煌市',title:'戈壁光电产业园',type:'戈壁集中式',
        analysis:'观察戈壁地表、成片阵列、园区道路与能源设施，结合辐射指标理解开阔地区的大尺度开发。',images:[search('甘肃敦煌 戈壁 光伏电站 航拍','敦煌戈壁光伏电站检索预览')]}
    ]},
    '640000': {name:'宁夏',cases:[
      {id:'ningxia-zhongwei',location:'中卫市 · 沙坡头区',title:'腾格里沙漠新能源基地',type:'沙漠集中式 · 生态治理',
        analysis:'沙丘、组件阵列与防风固沙设施并置，体现新能源基地与生态治理的空间联系。',images:[search('宁夏中卫 沙坡头 腾格里沙漠 光伏','中卫腾格里沙漠光伏检索预览')]}
    ]},
    '410000': {name:'河南',cases:[
      {id:'henan-lankao',location:'开封市 · 兰考县',title:'农村屋顶光伏',type:'户用分布式',
        analysis:'村庄屋顶上的组件体现项目密集而分散的形态，可与集中式基地比较空间组织与就地利用条件。',images:[search('河南兰考 农村 屋顶 光伏','兰考农村屋顶光伏检索预览')]}
    ]},
    '420000': {name:'湖北',cases:[
      {id:'hubei-xiantao',location:'仙桃市',title:'渔光互补项目',type:'水面养殖与发电复合利用',
        analysis:'池塘、水面养殖与光伏支架的组合体现水面资源和农业生产的复合利用，需同时考虑生态边界与水面利用条件。',images:[search('湖北仙桃 渔光互补 光伏 航拍','仙桃渔光互补光伏检索预览')]}
    ]}
  };
  window.ATLAS_PROVINCE_CASE_NOTE = '案例照片呈现项目的现场形态，不单独证明整县装机、综合评分或开发潜力。';
})();
