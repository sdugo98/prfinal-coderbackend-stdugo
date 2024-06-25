export class ProductsService {
    constructor(dao){
        this.dao = new dao()
    }
     async getProducts(limit,page,category,sort, disp){
        return await this.dao.getProducts(limit,page,category,sort, disp)
     }

     async getProductById(id){
        return await this.dao.getProductById(id)
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
      ){
         return await this.dao.createProduct(      title,
            description,
            code,
            price,
            stock,
            category,
            thumbnail,
            owner)
      }

      async updateProduct(id, body){
         return await this.dao.updateProduct(id,body)
      }
      async deleteProduct(id){
         return await this.dao.deleteProduct(id)
      }
}
import { ProductsDAO } from "../dao/productsDAO.js"
export const productsService = new ProductsService(ProductsDAO)