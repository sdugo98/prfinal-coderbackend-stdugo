import mongoose from "mongoose"

const usersEsquema = new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        email: {
            type: String, unique: true
        },
        age: Number,
        password: String,
        cart: {},
        rol: { type: String, default: 'user' },
        documents: [{
            name: { type: String, required: false },
            reference: { type: String, required: false }
        }],
        last_connection: { type: Date, required: false }
    },
    {
        timestamps: {
            updatedAt: 'DateUltimateMod', createdAt: 'DateOn'
        }
    }, { strict: false }
)

usersEsquema.pre('findOne', function () {
    this.populate({
        path: 'cart.cart',
        populate: {
            path: 'products.product',
            model: 'products'
        }
    });
});


export const userModel = mongoose.model('users', usersEsquema)