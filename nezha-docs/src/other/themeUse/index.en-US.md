---
map:
   path: /themeUse
---

# 介绍
主题核心其实就是 颜色的改变 <br>

目前前端主题实现的基本原理就是 css变量，在不同class名称下 配置不同的css变量 <br>

# 位置<br>
黑色 对应class .theme-dark 对应变量文件为 src/assets/css/themes/theme-dark.scss <br>
白色 对应class .theme-light 对应变量文件为 src/assets/css/themes/theme-light.scss<br>
主题切换是 将class名替换为对应即可<br>
注意 黑色和白色主题的变量名 需要一一对应

# 使用
当你想使用颜色属性时 需要到对应位置搜索对应颜色 或者根据备注使用相应的颜色<br>
例 :
```
黑色 $--color-font: #FFFFFF
白色 $--color-font: #000000
.font{
    color: $--color-font
}
```