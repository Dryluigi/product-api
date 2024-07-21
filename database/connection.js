const { default: mongoose } = require("mongoose");

async function connectDb() {
    const connectionUri = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/products?authSource=admin`
    await mongoose.connect(connectionUri)
}

connectDb()
