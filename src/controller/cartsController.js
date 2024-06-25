import { cartsService } from "../services/carts.Service.js";
import mongoose from "mongoose";
import { io } from "../app.js";
import { productsService } from "../services/products.Service.js";
import { ticketService } from "../services/ticket.Service.js";
import { v4 } from "uuid";
import { CustomError } from "../utils/customError.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";
import { sendMail } from "../mails/mails.js";

function idValid(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return CustomError.CustomError('Error al validar ID', 'ID Invalido', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS);
  }
}

export class CartsController {
  constructor() { }

  static async render(req, res) {
    try {
      let carts = await cartsService.getCarts();
      if (carts.length <= 0) {
        return res.status(200).json({ message: 'No hay carritos en BD' })
      }

      if (req.query.limit) {
        carts = carts.slice(0, req.query.limit);
      }

      return {
        carts,
      };
    } catch (error) {
      return CustomError.CustomError('Error al renderizar', 'Error al renderizar', STATUS_CODES.NOT_FOUND, ERRORES_INTERNOS.OTROS)
    }
  }

  static async getCartById(req, res) {
    try {
      let { id } = req.params;
      let valid = idValid(id, res);
      if (valid) {
        return null;
      }

      let getCart = await cartsService.getCartById(id);
      if (!getCart) {
        return null
      }
      return getCart
    } catch (error) {
      return res.status(500).json({
        Error: CustomError.CustomError('NO SE ENCONTRO CARRITO', 'NO SE ENCONTRO CARRITO', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS)
      });
    }
  }

  static async addProductInCart(req, res) {
    try {
      let { cid } = req.params;
      let valid = idValid(cid, res);
      if (valid) {
        return res.status(404).json({
          error: 'ID INVALIDO'
        })
      }
      let { pid } = req.params;
      let validpid = idValid(pid, res);
      if (validpid) {
        return res.status(404).json({
          error: 'ID INVALIDO'
        });
      }
      const product = await productsService.getProductById(pid);
      if (!product) {
        return res.status(404).json({
          error: 'ERROR AL RECUPERAR PRODUCTO'
        });
      }

      if (req.user.rol == "premiun") {
        if (req.user.email == product.owner) {
          return res.status(403).json({
            error: 'No puedes agregar productos creados por ti'
          });
        }
      }

      let cartMod = await cartsService.addProductInCart(cid, product);
      if (!cartMod) {
        return res.status(500).json({
          error:
            'Error al agregar producto al carrito',
        });
      }
      return res.status(200).json({ cartMod });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


  static async createCart(req, res) {
    try {
      let { title } = req.body;
      if (!title) {
        return res.status(403).json({ error: 'Coloque un titulo' })
      }

      let createCart = await cartsService.createCart(title);
      if (!createCart) {
        return res.status(500).json({ error: "error al crear" });
      }

      io.emit("listCarts", await cartsService.getCarts());
      return res.status(200).json({ CarroCreado: createCart.title });
    } catch (error) {
      return CustomError.CustomError('Internal error', 'error interno', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.INTERNAL)
    }
  }

  static async deleteProductInCart(req, res) {
    try {
      let { cid } = req.params;
      let valid = idValid(cid, res);
      if (valid) {
        return res.status(404).json({ error: "ID invalido" });
      }
      let { pid } = req.params;
      let validpid = idValid(pid, res);
      if (validpid) {
        return res.status(404).json({ error: "ID invalido" });
      }
      const product = await productsService.getProductById(pid);
      if (!product) {
        return res.status(404).json({ error: "error al recuperar producto" });
      }

      let cartMod = await cartsService.deleteProductInCart(cid, product);
      if (!cartMod) {
        return res.status(404).json({ error: "Producto inexistente en carrito. ERROR" });
      }
      return res.status(200).json({ cartMod });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteAllProductsInCart(req, res) {
    try {
      let { cid } = req.params;
      let valid = idValid(cid, res);
      if (valid) {
        return res.status(404).json({ error: "ID invalido" });
      }

      let cartMod = await cartsService.deleteAllProductsInCart(cid);
      if (!cartMod) {
        return res.status(404).json({ error: "Inexistencia de productos en carrito. Error" });
      }
      return res.status(200).json({ cartMod });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateCart(req, res) {
    try {
      let { id } = req.params;
      let valid = idValid(id);
      if (valid) {
        return res.status(404).json({ error: "ID invalido" });
      }


      if (req.body._id) {
        return res.status(403).json({ error: "no se puede modificar la propiedad _id" });
      }

      let putCart = await cartsService.updateCart(id, req.body);
      if (!putCart) {
        res.status(500).json({ error: "error al modificar" });
        return null;
      }
      io.emit("listCarts", await cartsService.getCarts());
      return res.status(200).json({ putCart });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async modifiedProductInCart(req, res) {
    try {
      let { cid } = req.params;
      let valid = idValid(cid, res);
      if (valid) {
        return res.status(404).json({ error: "ID invalido" });
      }
      let { pid } = req.params;
      let validpid = idValid(pid, res);
      if (validpid) {
        return res.status(404).json({ error: "ID invalido" });
      }

      let quantity
      if (req.body.quantity && Number(req.body.quantity) > 0) {
        quantity = (req.body.quantity)
      } else {
        return res.status(403).json({ error: 'Debes colocar una cantidad en numero y mayor a 0' })
      }


      const product = await productsService.getProductById(pid);
      if (!product) {
        return res.status(404).json({ error: "PRODUCTO INEXISTENTE EN CARRITO" });

      }

      let cartMod = await cartsService.modifiedProductInCart(cid, product, quantity);
      if (!cartMod) {
        return res.status(500).json({ error: "Algo salio mal- Intente mas tarde" });
      }
      return res.status(200).json({ cartMod });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async confirmBuy(req, res) {
    try {
      let user = req.user
      let { cid } = req.params;
      let valid = idValid(cid, res);
      if (valid) {
        return res.status(404).json({ error: "ID invalido" });
      }

      let cart = await cartsService.getCartById(cid);

      if (!cart) {
        return res.status(404).json({ error: "Error al recuperar el carrito" });
      }

      if (!cart.products || cart.products.length === 0) {
        return res.status(403).json({ error: "Carrito Vacio" });
      }

      let prodOK = [];
      let prodCancel = [];

      for (const p of cart.products) {
        let id = p.product._id
        let prodsBD = await productsService.getProductById(id);
        let stock = prodsBD.stock - p.quantity;

        if (stock < 0) {
          prodCancel.push(p);
        } else {
          prodOK.push(p);
          let prodMod = await productsService.updateProduct(p.product._id, { stock: stock });
          if (!prodMod) {
            return res.status(500).json({ error: "ERROR INTERNO AL ACTUALIZAR STOCK" });
          }
        }
      }
      for (const prod of prodOK) {
        let clearCart = await cartsService.deleteProductInCart(cid, prod.product._id);
        if (!clearCart) {
          return res.status(500).json({ error: "ERROR AL ACTUALIZAR CARRITO" });
        }
      }

      prodOK.forEach((prod) => {
        prod.subtotal = (prod.product.price * prod.quantity).toFixed(2);
      });

      const total = prodOK.reduce((acc, prod) => acc + parseFloat(prod.subtotal), 0).toFixed(2);

      return res.status(200).json({total: total})

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }


}
