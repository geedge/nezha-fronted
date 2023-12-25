import enLocale from 'element-ui/lib/locale/lang/en' // 引入element语言包
const newen = {
// 命名原则
// 创建使用New
// 表示创建状态用Created，如创建时间Created Time
// 告警使用Alert，而不是Alarm
// 账号用Account，username、password等都属于account的一部分
// A user is the person who uses the account, the account is an inanimate object that is merely registered to an e-mail address.
  setup: {
    step0: 'Welcome',
    step1: 'Database',
    step2: 'Redis',
    step3: 'System',
    host: 'Host',
    port: 'Port',
    language: 'Language',
    welcome: {
      header: 'Welcome to Nezha setup wizard!',
      guid: 'What will the wizard do for you?',
      guid_1: 'Create a basic configuration',
      guid_2: 'Tries to find problems within your Database and Redis setup',
      toContinue: 'To continue',
      creatFile: 'For security reasons you need to authenticate for the installation by creating the file',
      createFileTip: 'This can be done by executing the following command',
      next: "Click the 'Next' button when you've finished."
    },
    database: {
      configTitle: 'Configure DB connection',
      configTip: "Please create database manually,and set the configuration parameters for connection to this database,Press 'Next' button when done"
    },
    redis: {
      configTitle: 'Configure Redis connection',
      configTip: "Please set the configuration parameters for connection to this redis,Press 'Next' button when done"
    },
    system: {
      configTitle: 'System configuration',
      configTip: 'Please enter username and password for administrator ,and set the Nezha WEB module install information,like IP:port',
      federation: 'Federation',
      federationEnable: 'Enable',
      federationDisable: 'Disable'

    },
    name: 'Database name',
    username: 'Username',
    pin: 'Password',
    alertPath: 'Site URL',
    alertPrefix: 'Alert prefix',
    haMode: 'HA mode',
    haVip: 'Virtual IP',
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    invalidDb: 'There may be some errors in the configuration of the database',
    invalidRedis: 'There may be some errors in the configuration of the Redis',
    invalidPin: "Redis's password may be wrong",
    requirePin: 'The password may be required by the Redis',
    wait: 'The configuration has been saved, please wait patiently for it to take effect',
    reloadTimeout: 'It took too much time to restart the server, there may be some problems when you install',
    hadConfig: 'Someone has started to configure the system',
    invalidCode: "The authentication is invalid ,please follow the description in {page} 'To continue'",
    welcomePage: 'Welcome page',
    inited: 'The system has been initialized'
  },
  login: {
    username: 'Username',
    pin: 'Password',
    login: 'Login',
    upload: 'Upload license',
    verify: 'Verify code',
    verifyDialogTitle: 'Two Factor Authentication Set Up',
    verifyTitle: 'Two-Factor Authentication',
    verifyContent: 'Enter the code from the two -factor app on your mobile device. If you\' ve lost your device, you may enter one of your recovery codes.',
    verifyPlaceholder: 'verify code',
    bindFail: 'Binding failure'
  },
  asset: {
    host: 'Host',
    port: 'Port',
    talon: {
      enable: 'Enable'
    }
  },
  validate: {
    required: 'Required',
    host: 'Invalid Host',
    number: 'Numeric',
    port: 'Invalid port',
    special: 'Cannot contain special characters',
    unavailable: 'Unavailable'
  },
  profile: {
    username: 'User name'
  },
  license: {
    downloadID: 'Download c2v file'
  },
  overall: {
    system: 'System',
    back: 'Back',
    enabled: 'Enabled',
    disabled: 'Disabled',
    unavailable: 'Unavailable'
  },
  tip: {
    zoomStatusPrompt: 'Your browser is currently in zoom state, the page may appear dislocation, the proposed 100% size.',
    doNotAskAgain: 'Do not ask again'
  },
  ...enLocale
}
export default newen
