# 使用方式
在vue的原型链上挂载了 lodash 直接 **this.$lodash + 对应函数即可** （this.$lodash.cloneDeep()）

# 常用函数介绍
* 1 深拷贝    项目之后的深拷贝都用这种形式

          this.$lodash.cloneDeep(value)

          参数

          value (*): 要深拷贝的值。

          返回

          (*): 返回拷贝后的值。
* 2 对象根据路径取值      获取对象的值 key 超过2个的都才采用这种方式获取

       this.$lodash.get(object, path, [defaultValue])

       参数

       object (Object): 要检索的对象。

       path (Array|string): 要获取属性的路径。

       [defaultValue] (*): 如果解析值是 undefined ，这值会被返回。

       返回

       (*): 返回解析的值。

       例子
        var object = { 'a': [{ 'b': { 'c': 3 } }] };
        this.lodash.get(object, 'a[0].b.c') => 3

        this.lodash.get(object, ['a', '0', 'b', 'c']); => 3

        this.lodash.get(object, 'a.b.c', 'default'); => 'default'

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

* 5 数组对象 查找元素

       this.$lodash.find(collection, [predicate=_.identity], [fromIndex=0])

       参数

       collection (Array|Object): 一个用来迭代的集合。

       [predicate=_.identity] (Array|Function|Object|string): 每次迭代调用的函数。

       [fromIndex=0] (number): 开始搜索的索引位置。

       返回

       (*): 返回匹配元素，否则返回 undefined。

       例子

       var users = [
           { 'user': 'barney',  'age': 36, 'active': true },
           { 'user': 'fred',    'age': 40, 'active': false },
           { 'user': 'pebbles', 'age': 1,  'active': true }
         ];

         this.$lodash.find(users, function(o) { return o.age < 40; }) => { 'user': 'barney',  'age': 36, 'active': true }

         this.$lodash.find(users, { 'age': 1, 'active': true });  => { 'user': 'pebbles', 'age': 1,  'active': true }

        this.$lodash.find(users, 'active');  => object for { 'user': 'barney',  'age': 36, 'active': true }

* 6 检查是否是数组

      this.$lodash.isArray(value)
* 7 检查是对象  数组 是否为空

       this.$lodash.isEmpty(value)

* 8 检查是否是对象

       this.$lodash.isObject(value)



