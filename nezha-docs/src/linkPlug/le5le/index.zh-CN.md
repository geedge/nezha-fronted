---
map:
  path: /le5le
---
# 官方文档
https://doc.le5le.com/document/119882449

拓扑图相关插件

# 注意事项

1. 图片在本地无法显示，若需要显示 可以在图片url前添加对应的网址
2. 鼠标框选错位

   原因

   父 dom 元素 css 还没渲染完，就加载画布，确认方式：new Meta2d 时，查看父 dom 的 clientWidth 和 clientHeight 是否存在；
   修改了父 dom 元素位置，可能是存在动画

   解决方案

   等待父 dom 元素 css 加载完成后在 new Meta2d
   确定画布位置已经稳定时，修正画布位置： meta2d.resize();
3. 报错：pen无calculative属性

   是否使用了 meta2d.data() 获取的pens进行操作 meta2d.data() 仅仅用于文件保存。改用 meta2d.store.data.pens 获取画布中的对象即可。


<API src="./index.vue" lang="zh"></API>

