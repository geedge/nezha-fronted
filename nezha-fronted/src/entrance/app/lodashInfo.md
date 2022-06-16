# 使用方式
在vue的原型链上挂载了 lodash 直接 **this.$lodash + 对应函数即可** （this.$lodash.cloneDeep()）

# 常用函数介绍
* 1 深拷贝

          this.$lodash.cloneDeep(value)

          参数

          value (*): 要深拷贝的值。

          返回

          (*): 返回拷贝后的值。

* 2 创建一个新数组，将array与任何数组 或 值连接在一起

        this.$lodash.concat(array, [values])

        参数

        array (Array): 被连接的数组。

        [values] (...*): 连接的值。

        返回值

        (Array): 返回连接后的新数组。
* 3 数组去重

        this.$lodash.uniq(array)

        参数

        array (Array): 要检查的数组。

        返回

        (Array): 返回新的去重后的数组。

* 4 数组对象去重

       this.$lodash.uniqBy(array, [iteratee=_.identity])

        参数

        array (Array): 要检查的数组。

        [iteratee=_.identity] (Array|Function|Object|string): 迭代函数，调用每个元素。

        返回

        (Array): 返回新的去重后的数组。

       例子
       this.$lodash.uniqBy([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x') =  [{ 'x': 1 }, { 'x': 2 }]


