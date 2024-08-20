const { default: mongoose } = require("mongoose");

async function connectDb() {
    const connectionUri = process.env.MONGO_CONNECTION
    await mongoose.connect(connectionUri)
}

connectDb()
