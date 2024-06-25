import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'

const productsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        code: { type: String, unique: true, required: true },
        price: { type: Number, required: true },
        status: {
            type: Boolean, default: true
        },
        stock: { type: Number, required: true },
        category: { type: String, required: true },
        thumbnail: String,
        owner: { type: String, required: true }
    }, { collection: 'products' }
)

productsSchema.plugin(paginate)


export const productsModel = mongoose.model('products', productsSchema)