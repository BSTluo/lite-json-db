import axios from 'axios'
import * as fs from 'fs'
import * as path from 'path'

// 此变量存储词库数据位置
// let fileDir:string

const config = {
  'host': ''
}
/**
  * 返回一个文件的json对象
  * @param list 数据库文件目录（wordconfig/userData/wordData）
  * @param name json文件名
  * @return 词库json对象
  */
const getjson = (fileDir:string ,list:string, name:string) => {
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
const update = (fileDir:string, list:string, name:string, file:object) => {
  try {
    fs.writeFileSync(path.join(fileDir, `./word/${list}/${name}.json`), JSON.stringify(file, null, 3))
  } catch (error) {
  }
}

export default class dictionary {
  id: string
  fileDir: string
  /**
   * 定义数据库存储位置
   * @param dir 存储库根目录
   * @param id 操作者id
   * @param host 指定云服务器，可为null
   */
  constructor (dir:string, id:string, host?:string|null) {
    this.fileDir = dir
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
  getDBObject = () => { return getWordLibraryObject(this.fileDir) }

  /**
   * 获取已有数据库列表
   * @returns 查询结果[库名,库名]
   */
  getDBList = () => {
    /*
    const out = ['[词库核心]', '当前有以下词库：'].concat(getWordLibraryList()).join('\n')
    return out
    */
    return getWordLibraryList(this.fileDir)
  }

  /**
   * 根据关键词查找库名
   * @param key 关键词
   * @returns 数组 查询结果[库名,库名]
   */
  findDB = (key:string) => {
    /*
    const out = ['[词库核心]', '当前有以下词库：'].concat(findWordLibraryList(key)).join('\n')
    return out
    */
    return findWordLibraryList(this.fileDir, key)
  }

  /**
   * 根据关键词查找键
   * @param key 关键词
   * @returns 查询结果[[库名, 问],[库名, 问]...]
   */
  findTrigger = (key:string) => { return toFindTrigger(this.fileDir, key)[0] }

  /**
   * 根据关键词查找值
   * @param key 关键词
   * @returns 查询结果[[库名, 问, 答],[库名, 问, 答]...]
   */
  findReport = (key:string) => { return toFindTrigger(this.fileDir, key)[1] }

  /**
   * 添加单个值
   * @param key 键
   * @param item 值
   * @returns 结果(返回此键的长度)
   */
  addSingle = (key:string, item:string) => { return addWord(this.fileDir, [this.id, key, item]) }

  /**
   * 将一些数据设置为某个键
   * @param key 键
   * @param arr 数据(['a','b',.....])
   * @returns 结果
  */
  setKey = (key:string, arr:string[]) => { return setKey(this.fileDir, this.id, key, arr) }

  /**
   * 将一些数据添加到某个键
   * @param key 键
   * @param arr 数据(['a','b',.....])
   * @returns 结果
  */
  addArray = (key:string, arr:string[]) => { return addArray(this.fileDir, this.id, key, arr) }

  /**
   * 删除键的某个下标
   * @param key 键
   * @param serialNumber 序号(从1开始、为all则全删)
   * @returns 结果(成功/失败)
   */
  del = async(key:string, serialNumber:string) => { return delWord(this.fileDir, [this.id, key, serialNumber]) }

  /**
   * 下载json到本地(覆盖)
   * @param key 下载码
   * @param name json文件名称
   * @returns 结果(成功/失败)
   */
  download = async(key:string, name:string) => { return download(this.fileDir, key, name) }

  /**
   * 上传本地json到云端
   * @param key 库名(不用加.json)
   * @returns 结果(下载码/失败)
   */
  upload = (key:string) => { return upload(this.fileDir, key) }

  /**
   * 修改编辑指针
   * @param key 到哪个json
   * @returns 结果(成功)
   */
  modifyPointer = (key:string) => { return modifyPointer(this.fileDir, [this.id, key]) }

  /**
   * 重置编辑指针到'公共'
   * @returns 结果(成功)
   */
  resetPointer = () => { return resetPointer(this.fileDir, this.id) }

  /**
   * 读取键值
   * @param key 需要读取的键
   * @param dbName 查询的词库
   * @returns 结果([])
   */
  readKeys = (key:string, dbName?:string|null) => { return readKeys(this.fileDir, key, dbName) }

  /**
   * 读取整个库
   * @param key 库名
   * @returns 返回结果({})
   */
  readObject = (key:string) => { return readObject(this.fileDir, key) }

  /**
   * 直接删除词库
   * @param dbName 词库名
   * @returns 结果
   */
  mandatoryDelete = (dbName: string) => { return mandatoryDelete(this.fileDir, dbName) }
}

/**
 * 获取数据库库表
 * @returns 数据库库表
 */
const getWordLibraryList = (fileDir:string) => {
  const fileName = path.join(fileDir, './word/wordData')
  const list = fs.readdirSync(fileName)
  const kulist:string[] = []

  list.forEach(function (item:string) {
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
const getWordLibraryObject = (fileDir:string) => {
  const list = getWordLibraryList(fileDir)
  const data: { [key: string]: string[] } = {}

  list.forEach(function (item:string) {
    const wordLibraryObj = getjson(fileDir, 'wordData', `${item}.json`)
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
const findWordLibraryList = (fileDir:string, keywords:string) => {
  const list = getWordLibraryList(fileDir)

  list.filter(function (item:string) {
    return item.indexOf(keywords) > 0
  })

  return list
}

/**
 * 查寻(问/答)触发词
 * @param key 需要寻找的关键词
 * @returns 输出结果[ [[库名, 问],[库名, 问]] , [[库名, 问, 答],[库名, 问, 答]] ]
 */
const toFindTrigger = (fileDir:string, key:string) => {
  const list = getWordLibraryList(fileDir)
  const resultKeysArray: string[][] = []
  const resultItemArray: string[][] = []

  list.forEach(function (item:string) {
    const wordLibraryObj = getjson(fileDir, 'wordData', `${item}.json`)
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
const addWord = (fileDir:string, information:string[]) => {
  const name = readPointer(fileDir, information[0])
  const q = information[1]
  const a = information[2]
  const data = getjson(fileDir, 'wordData', `${name}.json`)

  if (!data[q]) { data[q] = [] }
  data[q].push(a)

  update(fileDir, 'wordData', name, data)
  // return `[词库核心] 添加成功，当前序号为${data[q].length}`
  return data[q].length
}

/**
 * 删除键值
 * @param information [id, keys, 下标]
 * @returns 结果(成功/失败)
 */
const delWord = (fileDir:string, information:string[]) => {
  const name = readPointer(fileDir, information[0])
  const q = information[1]
  const index = String(information[2]) // 删除下标
  const data = getjson(fileDir, 'wordData', `${name}.json`)
  if (!data[q]) { /* return '[词库核心] 不存在这个词库啦...!' */ return '失败' }

  if (index === 'all') {
    delete data[q]
  } else {
    data[q].splice(Number(index) - 1)
  }

  update(fileDir, 'wordData', name, data)

  return '成功'
}

/**
 * 上传json到云
 * @param key json名(不加.json)
 * @returns 返回下载码/失败
 */
const upload = async(fileDir:string, key:string) => {
  const up = getjson(fileDir, 'wordData', `${key}.json`)
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
const download = async(fileDir:string, key:string, name:string) => {
  try {
    const response = await axios.post(`https://${config.host}/read.php`, {
      id: key
    })
    if (!response) { return }

    update(fileDir, 'wordData', name, response.data)
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
const modifyPointer = (fileDir:string, obj: string[]) => {
  const id = obj[0]
  const pointer = obj[1]
  const data = getjson(fileDir, 'wordconfig', 'listConfig.json')

  data[id] = pointer
  update(fileDir, 'wordconfig', 'listConfig', data)

  // return '[词库核心] 修改指针成功'
  return '成功'
}

/**
 * 恢复指针
 * @param id 字符串 是指你的id
 * @returns 结果(成功)
 */
const resetPointer = (fileDir:string, id:string) => {
  const data = getjson(fileDir, 'wordconfig', 'listConfig.json')
  if (!data[id]) { data[id] = '' }

  delete data[id]
  update(fileDir, 'wordconfig', 'listConfig', data)

  // return '[词库核心] 重置指针成功'
  return '成功'
}

/**
 * 读取编辑指针指向的库
 * @param key 被查询者id
 * @returns 结果
 */
const readPointer = (fileDir:string, key:string) => {
  const data = getjson(fileDir, 'wordconfig', 'listConfig.json')
  if (!data[key]) { data[key] = '公共' }
  return data[key]
}

/**
 * 读取键值
 * @param key 查询的键
 * @param dbName 查询的词库,可不填
 * @returns 返回结果([])
 */
 const readKeys = (fileDir:string, key:string, dbName?:string|null) => {
  let data: { [x: string]: any } = {}
  if (!dbName) { data = getWordLibraryObject(fileDir) }
  if (dbName) { data = getjson(fileDir, 'wordData', dbName) }

  if (!data[key]) { return undefined }
  return data[key]
}

/**
 * 读取整个库
 * @param key 库名
 * @returns 返回结果({})
 */
const readObject = (fileDir:string, key:string) => {
  const data = getjson(fileDir, 'wordData', `${key}.json`)
  return data
}

/**
 * 添加一堆数据到键
 * @param id 操作者id
 * @param key 键
 * @param data 添加的数组
 * @returns 结果
 */
const addArray = (fileDir:string, id:string, key:string, data:string[]) => {
  const name = readPointer(fileDir, id)
  const originData = getjson(fileDir, 'wordData', `${name}.json`)
  originData[key] = originData[key].concat(data)
  update(fileDir, 'wordData', name, originData)
  return '成功'
}

/**
 * 设置数据到键
 * @param id 操作者id
 * @param key 键
 * @param data 设定的数组
 * @returns 结果
 */
const setKey = (fileDir:string, id:string, key:string, data:string[]) => {
  const name = readPointer(fileDir, id)
  const originData = getjson(fileDir, 'wordData', `${name}.json`)
  originData[key] = data
  update(fileDir, 'wordData', name, originData)
  return '成功'
}

/**
 * 直接删除词库
 * @param dbName 词库名
 * @returns 结果
 */
const mandatoryDelete = (fileDir:string, dbName: string) => {
  try {
    fs.unlinkSync(path.join(fileDir, `./word/wordList/${dbName}.json`))
    return true
  } catch (err) {
    return null
  }
}
