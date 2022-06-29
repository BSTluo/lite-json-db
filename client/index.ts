import dictionary from './main/index'


const test = new dictionary(__dirname, 'admin', null)

test.modifyPointer('json库1')
test.addSingle('a', 'b')
test.addArray('a',['c','d','e','f'])


console.log(test.readKeys('a'))
console.log(test.readObject('json库1'))