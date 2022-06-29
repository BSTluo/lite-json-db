import litejson from './main/index'


const lJson = new litejson(__dirname, 'admin', null)

lJson.modifyPointer('json库1')
lJson.addSingle('a', 'b')
lJson.addArray('a',['c','d','e','f'])


console.log(lJson.readKeys('a'))
console.log(lJson.readObject('json库1'))