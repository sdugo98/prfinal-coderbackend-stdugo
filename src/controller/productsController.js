import { productsService } from "../services/products.Service.js";
import { io } from "../app.js";
import mongoose from "mongoose";
import { CustomError } from "../utils/customError.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";

function idValid(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return CustomError.CustomError('Error al validar ID', 'ID Invalido', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS);
  }
}

export class ProductsController {
  constructor() { }

  static async renderData(req) {
    let user = req.user;
    let error
    try {
      let page = 1;
      if (req.query.page) {
        page = req.query.page;
      }
      let category;
      if (req.query.category) {
        category = req.query.category;
      }

      let sort;
      if (req.query.sort) {
        sort = Number(req.query.sort);
      }
      let disp;

      if (req.query.disp === undefined) {
        disp = true;
      } else if (req.query.disp === "true" || req.query.disp === "false") {
        disp = req.query.disp === "true";
      } else {
        return ({ error: "Debe ser un dato tipo boolean (true o false)" });
      }


      let products = await productsService.getProducts(
        req.query.limit,
        page,
        category,
        sort,
        disp
      );

      return {
        error,
        user,
        products: products.docs,
        totalPages: products.totalPages,
        hasNextPage: products.hasNextPage,
        hasPrevPage: products.hasPrevPage,
        prevPage: products.prevPage,
        nextPage: products.nextPage,
        sort: sort
      };
    } catch (error) {
      return {
        error: error.message
      };
    }
  }


  static async getProductById(req, res) {
    try {
      let { id } = req.params;
      let valid = idValid(id, res);
      if (valid) {
        return null;
      }
      let user = req.user;
      let getProductById = await productsService.getProductById(id);
      if (!getProductById) {
        return null;
      }
      return { user, getProductById }
    } catch (error) {

      return CustomError.CustomError('Error al validar ID', 'ID Invalido', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS);

    }
  }

  static async createProduct(req, res) {
    try {
      let { title, description, code, price, stock, category, thumbnail } =
        req.body;

      let owner = "Admin"
      if (req.user.rol === "premiun") {
        owner = req.user.email
      }

      if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({
          error: "Faltan campos obligatorios para agregar el producto.",
        });
      }

      let exReg = /[0-9]/;
      if (
        exReg.test(title) ||
        exReg.test(description) ||
        exReg.test(category)
      ) {
        return res
          .status(400)
          .json({
            error:
              "Controlar error numerico en  los siguientes campos: title, description, code, category",
          });
      }

      let confirmCreateProduct = await productsService.createProduct(
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnail,
        owner
      );
      if (!confirmCreateProduct) {
        return res.status(500).json({
          error: "error al crear",
        });
      }

      io.emit("listProduct", await productsService.getProducts());
      return res.status(201).json({
        confirmCreateProduct,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }


  static async updateProduct(req, res) {
    try {
      let {
        id
      } = req.params;
      let valid = idValid(id);
      if (valid) {
        return res.status(404).json({
          error: "NO SE ENCONTRO PRODUCTO"
        });
      }

      let getProductById = await productsService.getProductById(id);
      if (!getProductById) {
        return res.status(404).json({
          error: "NO SE ENCONTRO PRODUCTO"
        });
      }

      if (req.body._id) {
        return res.status(403).json({
          error: "no se puede modificar la propiedad _id"
        });
      }

      if (req.user.rol !== "Admin") {
        if (req.user.email !== getProductById.owner) {
          return res.status(403).json({ error: 'SOLO PUEDES MODIFICAR LOS PRODUCTOS CREADOS POR TI' })
        }
      }
      let putProduct = await productsService.updateProduct(id, req.body);
      if (!putProduct) {
        res.status(500).json({
          error: "error al modificar"
        });
        return null;
      }
      io.emit("listProduct", await productsService.getProducts());
      return res.status(200).json({
        putProduct
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async deleteProduct(req, res) {
    try {
      let {
        id
      } = req.params;
      let valid = idValid(id);
      if (valid) {
        return res.status(404).json({
          error: "NO SE ENCONTRO PRODUCTO"
        });
      }

      let getProductById = await productsService.getProductById(id);
      if (!getProductById) {
        return res.status(404).json({
          error: "NO SE ENCONTRO PRODUCTO"
        });
      }
      if (req.user.rol !== "Admin") {
        if (req.user.email !== getProductById.owner) {
          return res.status(403).json({ error: 'SOLO PUEDES ELIMINAR LOS PRODUCTOS CREADOS POR TI' })
        }
      }
      let prodDeleted = await productsService.deleteProduct(id)

      if (!prodDeleted) {
        return null;
      }
      io.emit("listProduct", await productsService.getProducts());
      return res.status(200).json({
        prodDeleted
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }


}
