import { productsModel } from "./models/productsModel.js";

export class ProductsDAO {
  async getProducts(limit, page, category, sort, disp) {
    try {
      let query;

      if (disp !== undefined) {
        query = { status: Boolean(disp) };
      }

      if (category) {
        query.category = category;
      }
      let options = {
        lean: true,
        page: page || 1,
        limit: limit || 10,
      };

      if (sort) {
        options.sort = { price: sort };
      }

      let products = await productsModel.paginate(query, options)
      return products;
    } catch (error) {
      return [];
    }
  }


  async getProductById(id) {
    let getProduct;
    try {
      getProduct = await productsModel.findOne({ status: true, _id: id });
      return getProduct;
    } catch (error) {
      return null;
    }
  }


  async createProduct(
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnail,
    owner
  ) {
    try {
      let newProduct = await productsModel.create({
        title: title,
        description: description,
        code: code,
        price: Number(price),
        stock: Number(stock),
        category: category,
        thumbnail: thumbnail,
        owner: owner
      });
      return newProduct;
    } catch (error) {
      return null;
    }
  }


  async updateProduct(id, body) {
    try {
      const existingProduct = await productsModel.findOne({
        status: true,
        _id: id,
      });
      if (!existingProduct) {
        return null;
      }

      const updatedProduct = await productsModel.updateOne(
        { _id: id },
        { $set: body }
      );

      if (updatedProduct.modifiedCount > 0) {
        return updatedProduct;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  async deleteProduct(id) {
    let getProduct;
    try {
      getProduct = await productsModel.findOne({ status: true, _id: id });

      let prodDeleted;
      try {
        prodDeleted = await productsModel.updateOne(getProduct, {
          $set: { status: false },
        });
        if (prodDeleted.modifiedCount > 0) {
          return prodDeleted;
        }
      } catch (error) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

}