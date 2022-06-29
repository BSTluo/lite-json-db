

[![CodeFactor](https://www.codefactor.io/repository/github/bstluo/lite-json-db/badge)](https://www.codefactor.io/repository/github/bstluo/lite-json-db)

# 简介

是轻型的json存储数据库...((?)

支持：

- 查询json列表
- 获取整个库对象
- 获取单个库对象
- 获取键值
- 云端导入导出json文件

<br/>

[客户端](./client)

[云服务端](./server)

# 快速开始

***

`demo.ts`

```typescript
import litejson from './main/index'


const lJson = new litejson(__dirname, 'admin', null)

lJson.modifyPointer('json库1')
lJson.addSingle('a', 'b')
lJson.addArray('a',['c','d','e','f'])


console.log(lJson.readKeys('a'))
console.log(lJson.readObject('json库1'))
```

<br/>

`使用  npm run test   启动demo.ts`

`使用  npm run start   启动index.ts`

# API

***

```typescript
litejson(存储根目录, 当前操作者用户名, 远程存储服务器(若无则写null))

lJson.getDBObject()                 获取全部数据库的整合json对象  - 返回为一个对象
lJson.getDBList()                   获取已有数据库列表            - 返回值为[库名,库名]
lJson.findDB('关键词')              查找包含此关键词的词库        - 返回值为[库名,库名]
lJson.findTrigger('关键词')         查找包含此关键词的键存在位置  - 返回值为[[库名, 问],[库名, 问]...]
lJson.findReport('关键词')          查找包含此关键词的值存在位置  - 返回值为[[库名, 问, 答],[库名, 问, 答]...]
lJson.addSingle('键', '值')         为键添加一个值                - 返回为此键的长度
lJson.setKey('键', ['值1','值2'])   为键添加一些值                - 返回是否成功
lJson.addArray('键', ['值1','值2']) 将键设置为一个值              - 返回是否成功
lJson.del('键', '1')                删除键的某个下标              - 返回是否成功
lJson.del('键', 'all')              删除整个键                    - 返回是否成功
lJson.download('下载码')            下载json到本地(覆盖)          - 返回是否成功
lJson.upload('库名')                上传某个json到云端            - 返回下载码/失败
lJson.modifyPointer('库名')         设置编辑指针                  - 返回是否成功
lJson.resetPointer()                重置编辑指针                  - 返回是否成功
lJson.readKeys('键')                获取键的值                    - 返回键值[]
lJson.readObject('库名')            获取库对象                    - 返回库对象{}



// 编辑指针代表当前正在编辑哪个库

```


# 服务端

***

服务端在php运行环境中即可使用
