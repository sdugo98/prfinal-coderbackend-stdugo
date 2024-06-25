import { cartsModel } from "../dao/models/cartsModel.js";
import { CustomError } from "../utils/customError.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";

export class CartsDAO {
  constructor() { }
  async getCarts() {
    try {
      let carts = await cartsModel.find({ status: true });
      return carts;
    } catch (error) {
      return [];
    }
  }

  async getCartById(cartId) {
    let getCart;
    try {
      getCart = await cartsModel.findOne({ status: true, _id: cartId }).populate('products.product');
      return getCart;
    } catch (error) {
      return CustomError.CustomError('NO SE ENCONTRO CARRITO', 'NO SE ENCONTRO CARRITO', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS)
    }
  }


  async addProductInCart(cid, product) {
    try {
      let getCart = await cartsModel.findOne({ status: true, _id: cid });
      if (!getCart) {
        return null;
      }


      if (!getCart.products || !Array.isArray(getCart.products)) {
        return null;
      }

      let productInCart = getCart.products.find(
        (prod) => prod.product._id.equals(product._id)
      );


      if (productInCart) {
        productInCart.quantity++;
      } else {
        getCart.products.push({
          product: product._id,
          quantity: 1,
        });
      }
      try {
        let cartMod = await cartsModel.updateOne(
          { _id: cid },
          { products: getCart.products }
        );
        if (cartMod.modifiedCount > 0) {
          let cart = await cartsModel.findOne({ _id: cid })
          return cart;
        }
      } catch (error) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async createCart(title) {
    try {
      let newCart = await cartsModel.create({ title: title });
      return newCart;
    } catch (error) {
      return null;
    }
  }

  async deleteProductInCart(cid, product) {
    try {
      let getCart = await cartsModel.findOne({ status: true, _id: cid });
      if (!getCart) {
        return null;
      }


      if (!getCart.products || !Array.isArray(getCart.products)) {
        return null;
      }

      let productInCart = getCart.products.find(
        (prod) => prod.product._id.toString() === product._id.toString()
      );

      if (!productInCart) {
        return null
      }

      try {
        let cartMod = await cartsModel.updateOne(
          { _id: cid },
          { $pull: { products: { product: product } } }
        );

        if (cartMod.modifiedCount > 0) {
          let cart = await cartsModel.findOne({ _id: cid })
          return cart;
        }
      } catch (error) {
        return null;
      }

    } catch (error) {
      return null;
    }
  }
  async deleteAllProductsInCart(cid) {
    try {
      let getCart = await cartsModel.findOne({ status: true, _id: cid });
      if (!getCart) {
        return null;
      }


      if (!getCart.products || !Array.isArray(getCart.products)) {
        return null;
      }

      try {
        let cartMod = await cartsModel.updateOne(
          { _id: cid },
          { $pull: { products: { object: getCart.products.object } } }
        );

        if (cartMod.modifiedCount > 0) {
          let cart = await cartsModel.findOne({ _id: cid })
          return cart;
        }
      } catch (error) {
        return null;
      }

    } catch (error) {
      return null;
    }
  }
  async updateCart(cid, body) {
    try {
      const existingCart = await cartsModel.findOne({ status: true, _id: cid });
      if (!existingCart) {
        return null;
      }

      const updatedCart = await cartsModel.replaceOne({ _id: cid }, body);

      if (updatedCart.modifiedCount > 0) {
        return updatedCart;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async modifiedProductInCart(cid, product, quantity) {
    try {
      let getCart = await cartsModel.findOne({ status: true, _id: cid });
      if (!getCart) {
        return null;
      }


      if (!getCart.products || !Array.isArray(getCart.products)) {
        return null;
      }

      let productInCart = getCart.products.find(
        (prod) => prod.product._id.toString() === product._id.toString()
      );

      if (!productInCart) {
        return null
      }

      let quantityProductInCart = (productInCart.quantity)


      try {
        let cartMod = await cartsModel.updateOne(
          { _id: cid, "products.product": product._id },
          { $set: { "products.$.quantity": quantity } }
        );

        if (cartMod.modifiedCount > 0) {
          let cart = await cartsModel.findOne({ _id: cid })
          return cart;
        }
      } catch (error) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}
