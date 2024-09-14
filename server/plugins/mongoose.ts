import type { Nitro } from 'nitropack'
import mongoose from 'mongoose'
import * as models from '../models/mongo'

export default async (_nitroApp: Nitro) => {
  // import models from server/models
  console.log('Loading models...')
  Object.keys(models).forEach((modelName) => {
    console.log(` - Loading model: ${modelName}`)
  })
  console.log('All models loaded')

  const mongoHost = process.env.MONGO_HOST || 'mongo'
  const uri = `mongodb://mongo:mongo@${mongoHost}:27017`
  const db = 'mydu-discord'
  const connection_uri = `${uri}/${db}?authSource=admin`
  console.log('MongoDB connection URI: ', connection_uri)
  await mongoose.connect(connection_uri)
  console.log('Connected to MongoDB')
}
