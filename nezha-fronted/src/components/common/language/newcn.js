import zhLocale from 'element-ui/lib/locale/lang/zh-CN' // 引入element语言包
const newcn = {
  setup: {
    step0: '欢迎',
    step1: '数据库',
    step2: 'Redis',
    step3: '系统',
    host: 'Host',
    port: '端口',
    language: '语言',
    welcome: {
      header: '欢迎使用哪吒安装向导！',
      guid: '向导将为您做什么?',
      guid_1: '创建基本的配置',
      guid_2: '尝试在数据库和Redis设置中查找问题',
      toContinue: '继续',
      creatFile: '出于安全原因，您需要通过创建文件来验证安装',
      createFileTip: '这可以通过执行以下命令来完成',
      next: '完成后单击“下一步”按钮.'
    },
    database: {
      configTitle: '配置数据库连接',
      configTip: '请手动创建数据库，并设置连接到此数据库的配置参数，完成后按“下一步”按钮'
    },
    redis: {
      configTitle: '配置Redis连接',
      configTip: '请设置连接到此redis的配置参数，完成后按“下一步”按钮'
    },
    system: {
      configTitle: '系统配置',
      configTip: '请输入管理员的用户名和密码，并设置Nezha WEB模块的安装信息，如IP:port',
      federation: '集群',
      federationEnable: '可用',
      federationDisable: '不可用'
    },
    name: '数据库名称',
    username: '用户名',
    pin: '密码',
    alertPath: '网站URL',
    alertPrefix: '警报前缀',
    haMode: 'HA 模式',
    haVip: '虚拟的 IP',
    next: '下一步',
    back: '返回',
    finish: '完成',
    invalidDb: '数据库配置可能存在一些错误',
    invalidRedis: 'Redis的配置可能有一些错误',
    invalidPin: 'Redis的密码可能错误',
    requirePin: 'Redis可能需要密码',
    wait: '配置已保存，请耐心等待生效',
    reloadTimeout: '重新启动服务器花了太多时间，安装可能有一些问题',
    hadConfig: '已经有人开始配置系统',
    invalidCode: '身份验证无效，请按照{page}中的描述继续',
    welcomePage: '欢迎页面',
    inited: '系统已经被初始化'
  },
  login: {
    username: '登录名',
    pin: '密码',
    login: '登录',
    verify: '验证',
    verifyDialogTitle: '双因子认证设置',
    verifyTitle: '双因子认证',
    verifyContent: '在您的移动设备上输入来自双因子应用程序的代码。 如果您丢失了设备，您可以输入您的恢复代码之一。',
    verifyPlaceholder: '验证码',
    bindFail: '绑定失败'
  },
  asset: {
    host: 'Host',
    port: '端口',
    talon: {
      enable: '启用'
    }
  },
  validate: {
    required: '必填项',
    host: '不合法的IP',
    number: '必须是数字',
    port: '不合法的端口',
    special: '不能包含特殊字符',
    unavailable: '不可用'
  },
  profile: {
    username: '用户名'
  },
  license: {
    downloadID: '下载c2v文件'
  },
  overall: {
    system: '系统',
    back: '返回',
    enabled: '启用',
    disabled: '已禁用',
    unavailable: '不可用'
  },
  tip: {
    zoomStatusPrompt: '您的浏览器目前处于缩放状态，页面可能会出现错位，建议100%大小。',
    doNotAskAgain: '不再询问'
  },
  ...zhLocale
}
export default newcn
