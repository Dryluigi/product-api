const fileRequired = (_, { req }) => {
    if (!req.file)  throw new Error('file is required')
    return true
}

const specificFileTypes = (allowedTypes) => {
    return (_, { req }) => {
        if (!allowedTypes.includes(req.file.mimetype)) throw new Error('invalid file type')
        return true
    }
}

const fileSize = (fileSize) => {
    return (_, { req }) => {
        if (req.file.size > fileSize) throw new Error('invalid file size')
        return true
    }
}

module.exports = {
    fileRequired,
    specificFileTypes,
    fileSize,
}