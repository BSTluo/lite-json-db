const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 此变量存储词库数据位置
let fileDir

const config = {
  'host': ''
}
/**
  * 返回一个文件的json对象
  * @param list 数据库文件目录（wordconfig/userData/wordData）
  * @param name json文件名
  * @return 词库json对象
  */
const getjson = (list, name) => {
  const wordPath = path.join(fileDir, `./word/${list}/${name}`)
  if (!fs.existsSync(wordPath)) {
    fs.writeFileSync(wordPath, '{}')
  }

  return JSON.parse(fs.readFileSync(wordPath).toString())
}

/**
  * 将词库json对象存储在文件内
  * @param list 数据库文件目录（wordconfig/userData/wordData）
  * @param name json文件名
  * @param file 词库json对象
  */
const update = (list, name, file) => {
  try {
    fs.writeFileSync(path.join(fileDir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

export default class dictionary {
  id
  /**
   * 定义数据库存储位置
   * @param dir 存储库根目录
   * @param id 操作者id
   * @param host 指定云服务器，可为null
   */
  constructor (dir, id, host) {
    fileDir = dir
    this.id = id
    config.host = (host) ? host : 'word.bstluo.top'

    try { fs.mkdirSync(path.join(dir, 'word')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/userData')) } catch (err) { }
    try { fs.mkdirSync(path.join(dir, 'word/wordconfig')) } catch (err) { }
  }

  /**
   * 获取json对象
   * @returns json对象
   */
  getDBObject = () => { return getWordLibraryObject() }

  /**
   * 获取已有数据库列表
   * @returns 查询结果[库名,库名]
   */
  getDBList = () => {
    /*
    const out = ['[词库核心]', '当前有以下词库：'].concat(getWordLibraryList()).join('\n')
    return out
    */
    return getWordLibraryList()
  }

  /**
   * 根据关键词查找库名
   * @param key 关键词
   * @returns 数组 查询结果[库名,库名]
   */
  findDB = (key) => {
    /*
    const out = ['[词库核心]', '当前有以下词库：'].concat(findWordLibraryList(key)).join('\n')
    return out
    */
    return findWordLibraryList(key)
  }

  /**
   * 根据关键词查找键
   * @param key 关键词
   * @returns 查询结果[[库名, 问],[库名, 问]...]
   */
  findTrigger = (key) => { return toFindTrigger(key)[0] }

  /**
   * 根据关键词查找值
   * @param key 关键词
   * @returns 查询结果[[库名, 问, 答],[库名, 问, 答]...]
   */
  findReport = (key) => { return toFindTrigger(key)[1] }

  /**
   * 添加单个值
   * @param key 键
   * @param item 值
   * @returns 结果(返回此键的长度)
   */
  addSingle = (key, item) => { return addWord([this.id, key, item]) }

  /**
   * 将一些数据设置为某个键
   * @param key 键
   * @param arr 数据(['a','b',.....])
   * @returns 结果
  */
  setKey = (key, arr) => { return setKey(this.id, key, arr) }

  /**
   * 将一些数据添加到某个键
   * @param key 键
   * @param arr 数据(['a','b',.....])
   * @returns 结果
  */
  addArray = (key, arr) => { return addArray(this.id, key, arr) }

  /**
   * 删除键的某个下标
   * @param key 键
   * @param serialNumber 序号(从1开始、为all则全删)
   * @returns 结果(成功/失败)
   */
  del = async(key, serialNumber) => { return delWord([this.id, key, serialNumber]) }

  /**
   * 下载json到本地(覆盖)
   * @param key 下载码
   * @param name json文件名称
   * @returns 结果(成功/失败)
   */
  download = async(key, name) => { return download(key, name) }

  /**
   * 上传本地json到云端
   * @param key 库名(不用加.json)
   * @returns 结果(下载码/失败)
   */
  upload = (key) => { return upload(key) }

  /**
   * 修改编辑指针
   * @param key 到哪个json
   * @returns 结果(成功)
   */
  modifyPointer = (key) => { return modifyPointer([this.id, key]) }

  /**
   * 重置编辑指针到'公共'
   * @returns 结果(成功)
   */
  resetPointer = () => { return resetPointer(this.id) }

  /**
   * 读取键值
   * @param key 需要读取的键
   * @returns 结果([])
   */
  readKeys = (key) => { return readKeys(key) }

  /**
   * 读取整个库
   * @param key 库名
   * @returns 返回结果({})
   */
  readObject = (key) => { return readObject(key) }
}

/**
 * 获取数据库库表
 * @returns 数据库库表
 */
const getWordLibraryList = () => {
  const fileName = path.join(fileDir, './word/wordData')
  const list = fs.readdirSync(fileName)
  const kulist = []

  list.forEach(function (item) {
    const name = item.match(/(.*).json/)
    if (name) {
      kulist.push(name[1])
    }
  })

  return kulist
}

/**
 * 初始化数据库对象
 * @returns 数据库对象
 */
const getWordLibraryObject = () => {
  const list = getWordLibraryList()
  const data = {}

  list.forEach(function (item) {
    const wordLibraryObj = getjson('wordData', `${item}.json`)
    const thesaurusKeywordsList = Object.keys(wordLibraryObj)
    for (let i = 0; i < thesaurusKeywordsList.length; i++) {
      if (!data[thesaurusKeywordsList[i]]) {
        data[thesaurusKeywordsList[i]] = []
      }
      data[thesaurusKeywordsList[i]] = data[thesaurusKeywordsList[i]].concat(wordLibraryObj[thesaurusKeywordsList[i]])
    }
  })

  return data
}

/**
 * 查询库
 * @param keywords 查询关键词
 * @returns 包含此关键词的库名
 */
const findWordLibraryList = (keywords) => {
  const list = getWordLibraryList()

  list.filter(function (item) {
    return item.indexOf(keywords) > 0
  })

  return list
}

/**
 * 查寻(问/答)触发词
 * @param key 需要寻找的关键词
 * @returns 输出结果[ [[库名, 问],[库名, 问]] , [[库名, 问, 答],[库名, 问, 答]] ]
 */
const toFindTrigger = (key) => {
  const list = getWordLibraryList()
  const resultKeysArray = []
  const resultItemArray = []

  list.forEach(function (item) {
    const wordLibraryObj = getjson('wordData', `${item}.json`)
    const thesaurusKeywordsList = Object.keys(wordLibraryObj)

    for (const tagKeys of thesaurusKeywordsList) {
      if (tagKeys.indexOf(key) >= 0) {
        resultKeysArray.push([item, tagKeys])// [库名, 问]
      }

      for (const value of wordLibraryObj[tagKeys]) {
        if (value.indexOf(key) >= 0) {
          resultItemArray.push([item, tagKeys, value])// [库名, 问, 答]
        }
      }
    }
  })

  return [resultKeysArray, resultItemArray]
}

/**
 * 创建键值
 * @param information [id, keys, item]
 * @returns 结果(返回此键的长度)
 */
const addWord = (information) => {
  const name = readPointer(information[0])
  const q = information[1]
  const a = information[2]
  const data = getjson('wordData', `${name}.json`)

  if (!data[q]) { data[q] = [] }
  data[q].push(a)

  update('wordData', name, data)
  // return `[词库核心] 添加成功，当前序号为${data[q].length}`
  return data[q].length
}

/**
 * 删除键值
 * @param information [id, keys, 下标]
 * @returns 结果(成功/失败)
 */
const delWord = (information) => {
  const name = readPointer(information[0])
  const q = information[1]
  const index = String(information[2]) // 删除下标
  const data = getjson('wordData', `${name}.json`)
  if (!data[q]) { /* return '[词库核心] 不存在这个词库啦...!' */ return '失败' }

  if (index === 'all') {
    delete data[q]
  } else {
    data[q].splice(Number(index) - 1)
  }

  update('wordData', name, data)

  return '成功'
}

/**
 * 上传json到云
 * @param key json名(不加.json)
 * @returns 返回下载码/失败
 */
const upload = async(key) => {
  const up = getjson('wordData', `${key}.json`)
  if (JSON.stringify(up) !== '{}') {
    try {
      const response = await axios.post(`https://${config.host}/new.php`, up)
      return response.data
    } catch (error) {
      // return '[词库核心] 上传错误'
      return error
    }
  }
}

/**
 * 下载json到本地
 * @param key 下载码
 * @param name json文件名
 * @returns 结果(成功/失败)
 */
const download = async(key, name) => {
  try {
    const response = await axios.post(`https://${config.host}/read.php`, {
      id: key
    })
    if (!response) { return }

    update('wordData', name, response.data)
      // return ' [词库核心] 下载成功'
    return '成功'
    
  } catch (error) {
    // return '下载失败，请联系管理员手动进行投稿'
    return error
  }
}

/**
 * 修改指针
 * @param obj [id:string, 指向词库名]
 * @returns 结果(成功)
 */
const modifyPointer = (obj) => {
  const id = obj[0]
  const pointer = obj[1]
  const data = getjson('wordconfig', 'listConfig.json')

  data[id] = pointer
  update('wordconfig', 'listConfig', data)

  // return '[词库核心] 修改指针成功'
  return '成功'
}

/**
 * 恢复指针
 * @param id 字符串 是指你的id
 * @returns 结果(成功)
 */
const resetPointer = (id) => {
  const data = getjson('wordconfig', 'listConfig.json')
  if (!data[id]) { data[id] = '' }

  delete data[id]
  update('wordconfig', 'listConfig', data)

  // return '[词库核心] 重置指针成功'
  return '成功'
}

/**
 * 读取编辑指针指向的库
 * @param key 被查询者id
 * @returns 结果
 */
const readPointer = (key) => {
  const data = getjson('wordconfig', 'listConfig.json')
  if (!data[key]) { data[key] = '公共' }
  return data[key]
}

/**
 * 读取键值
 * @param key 查询的键
 * @returns 返回结果([])
 */
 const readKeys = (key) => {
  const data = getWordLibraryObject()
  if (!data[key]) { return undefined }
  return data[key]
}

/**
 * 读取整个库
 * @param key 库名
 * @returns 返回结果({})
 */
const readObject = (key) => {
  const data = getjson('wordData', `${key}.json`)
  return data
}

/**
 * 添加一堆数据到键
 * @param id 操作者id
 * @param key 键
 * @param data 添加的数组
 * @returns 结果
 */
const addArray = (id, key, data) => {
  const name = readPointer(id)
  const originData = getjson('wordData', `${name}.json`)
  originData[key] = originData[key].concat(data)
  update('wordData', name, originData)
  return '成功'
}

/**
 * 设置数据到键
 * @param id 操作者id
 * @param key 键
 * @param data 设定的数组
 * @returns 结果
 */
const setKey = (id, key, data) => {
  const name = readPointer(id)
  const originData = getjson('wordData', `${name}.json`)
  originData[key] = data
  update('wordData', name, originData)
  return '成功'
}
