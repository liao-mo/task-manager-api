require('./db/mongoose')
const Task = require('./models/task')

const deleteTaskAndCount = async (id) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: false })
    return count
}

deleteTaskAndCount('64afa03750ea512b48ab3673').then((count) => {
    console.log('count:' + count)
}).catch((error) => {
    console.log(error)
})