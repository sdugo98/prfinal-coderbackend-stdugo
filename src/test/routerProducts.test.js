import {
  describe,
  it
} from "mocha";
import {
  expect
} from "chai";
import supertest from "supertest";
import mongoose from "mongoose";
import {
  config
} from "../config/config.js";
import {
  v4
} from "uuid";
import {
  genToken
} from "../utils.js";

const requester = supertest("http://localhost:8080");

describe("PRUEBA ROUTER DE PRODUCTS", async function () {
  this.timeout(5000);

  let user = {
    first_name: "Sebastian",
    last_name: "Dugo TEST",
    edad: 20,
    email: "testing@testing.com",
    rol: "premiun",
    password: "wwwPPP",
  };
  let token = genToken(user);
  let productId;

  before(async () => {
    try {
      await mongoose.connect(config.MONGO_URL);
      console.log("BD Online");

      let product = {
        title: "PRODUCT TESTING SUPERTEST",
        description: "test",
        code: "testPUT",
        price: 22,
        stock: 22,
        category: "test",
      };
      let response = await requester
        .post("/api/products")
        .send(product)
        .set("Cookie", `CookieUser=${token}`);
      productId = response.body.confirmCreateProduct._id;
    } catch (error) {
      console.log(error.message);
    }
  });

  after(async () => {
    await mongoose.connection
      .collection("products")
      .deleteMany({
        category: "test"
      });
  });

  describe("Prueba Router products", async function () {
    it('Prueba endpoint GET /products. => Renderiza vista "ViewProducts", junto con un objeto que contiene: error, user, array de productos (10), componentes de paginacion', async function () {
      let respuesta = await requester
        .get("/products")
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
    });

    it('Prueba endpoint GET /products/:id  => Renderiza vista "ViewDetailProducts", junto con un objeto que contiene: el producto', async function () {
      let id = productId; 
      let respuesta = await requester
        .get(`/products/${id}`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
    });

    it("Prueba endpoint POST /api/products => Permite guardar un producto en BD", async function () {
      let product = {
        title: "PRODUCT TESTING SUPERTEST",
        description: "test",
        code: "testSPT",
        price: 22,
        stock: 22,
        category: "test",
      };

      let respuesta = await requester
        .post("/api/products")
        .send(product)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(201);
      expect(respuesta.ok).to.be.true;
      expect(respuesta._body.confirmCreateProduct).to.exist
    })
    
    it("Prueba endpoint POST con ERROR /api/products => Permite guardar un producto en BD", async function () {
      let product = {
        title: "PRODUCT TESTING SUPERTEST",
        stock: 22,
        category: "test",
      };

      let respuesta = await requester
        .post("/api/products")
        .send(product)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(400);
      expect(respuesta.ok).to.be.false;
      expect(respuesta._body.confirmCreateProduct).to.not.exist
    })

    it("Prueba endpoint POST con ERROR /api/products => Permite guardar un producto en BD", async function () {
      let product = {
        title: 12,
        description: 12,
        code: "testSPT",
        price: 22,
        stock: 22,
        category: "test",
      };

      let respuesta = await requester
        .post("/api/products")
        .send(product)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(400);
      expect(respuesta.ok).to.be.false;
      expect(respuesta._body.confirmCreateProduct).to.not.exist
    })
    

    it("Prueba endpoint PUT /api/products/:id => Permite modificar las propiedades de un producto en BD", async function () {
      let propMod = {
        title: "TEST PUT",
        code: v4()
      };
      let respuesta = await requester
        .put(`/api/products/${productId}`)
        .send(propMod)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
      expect(respuesta._body.putProduct.acknowledged).to.be.true

    });

    it("Prueba endpoint DELETE /api/products/:id => Permite eliminar un producto. Coloca su dispnibilidad en false.", async function () {
      let respuesta = await requester
        .delete(`/api/products/${productId}`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
      expect(respuesta._body.prodDeleted.acknowledged).to.be.true
    });
  });
});