import {
  describe,
  it,
  before
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
  genToken
} from "../utils.js";

const requester = supertest("http://localhost:8080");

describe('TESTING A ROUTER DE CARTS', async function () {
  this.timeout(5000);
  let user = {
    first_name: "Sebastian",
    last_name: "Dugo TEST",
    age: 20,
    email: "testing@testing.com",
    password: "wwwPPP",
    rol: "premiun",
  };

  let token
  let productId;
  let cartId

  before(async function () {
    try {
      await mongoose.connect(config.MONGO_URL);
    } catch (error) {
    }

    await requester.post('/api/sessions/registro').send({
      ...user
    });
    token = await genToken(user)
    let resUser = await requester.post(`/user`).send({
        email: user.email
      })
      .set("Cookie", `CookieUser=${token}`);
    cartId = resUser.body.user.cart._id
  });

  after(async () => {
    await mongoose.connection
      .collection("users")
      .deleteMany({
        email: "testing@testing.com"
      });
    await mongoose.connection
      .collection("carts")
      .deleteMany({
        title: "Carrito Supertest MODIFICADO TEST"
      });
    await mongoose.connection
      .collection("carts")
      .deleteMany({
        title: "Carrito Supertest"
      });
  });

  describe("Prueba Router carts", async function () {
    it('Pueba endpoint GET a /carts => Entra a BD y devuelve una vista que muestra todos los carritos recuperados', async function () {
      let respuesta = await requester.get('/carts').set("Cookie", `CookieUser=${token}`)
      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
    })

    it('Prueba endpoint GET /carts/:id => Recupera un carrito mediante id que llega por params, devuelve una vista del detalle del carrito', async function () {
      let id = "65bea34e1737d7efae6582f1";
      let respuesta = await requester
        .get(`/carts/${id}`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
    })

    it('Prueba endpoint POST CON ERROR Producto invalido /api/carts/:cid/product/:pid => Recupera un carrito y un producto, que llega por params, y en caso de darse las condiciones, se agrega el producto a el carrito.', async function () {
      
      let respuesta = await requester
        .post(`/api/carts/${cartId}/product/6574898c4ba22b2e935d`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(404);
      expect(respuesta.ok).to.be.false
      expect(respuesta._body.cartMod).to.not.exist
    })
    it('Prueba endpoint POST CON ERROR Carrito Id invalido /api/carts/:cid/product/:pid => Recupera un carrito y un producto, que llega por params, y en caso de darse las condiciones, se agrega el producto a el carrito.', async function () {
      let idCartInvalido = "invalid"
      let respuesta = await requester
        .post(`/api/carts/${idCartInvalido}/product/6574898c4ba22b2e935dfbc2`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(404);
      expect(respuesta.ok).to.be.false
      expect(respuesta._body.cartMod).to.not.exist
    })
    it('Prueba endpoint POST /api/carts/:cid/product/:pid => Recupera un carrito y un producto, que llega por params, y en caso de darse las condiciones, se agrega el producto a el carrito.', async function () {
    
      let respuesta = await requester
        .post(`/api/carts/${cartId}/product/6574898c4ba22b2e935dfbc2`)
        .set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200);
      expect(respuesta.ok).to.be.true;
      expect(respuesta._body.cartMod).exist
    })

    it('Prueba endpoint POST /api/carts => Se envia un titulo y el servidor crea un carrito', async function () {
      
      let userADMIN = {
        first_name: "Aguss",
        last_name: "Lovera",
        age: 20,
        email: "testing@testingADMIN.com",
        password: "wwwPPP",
        rol: "Admin",
      };
      let tokenADMIN = await genToken(userADMIN)
      let title = 'Carrito Supertest'
      let respuesta = await requester.post('/api/carts').send({
        title: title
      }).set("Cookie", `CookieUser=${tokenADMIN}`);
      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.CarroCreado).exist
    })
    it('Prueba endpoint POST con ERROR /api/carts => NO se envia un titulo', async function () {
      let userADMIN = {
        first_name: "Aguss",
        last_name: "Lovera",
        age: 20,
        email: "testing@testingADMIN.com",
        password: "wwwPPP",
        rol: "Admin",
      };
      let tokenADMIN = await genToken(userADMIN)
      let respuesta = await requester.post('/api/carts').set("Cookie", `CookieUser=${tokenADMIN}`);
      expect(respuesta.statusCode).to.be.equal(403)
      expect(respuesta.ok).to.be.false
      expect(respuesta._body.CarroCreado).to.not.exist
    })

    it('Prueba endpoint DELETE /api/carts/:cid/product/:pid => Se encarga de borrar el producto obtenido por id, en el carrito tambien obtenido por params', async function () {
      
      let respuesta = await requester.delete(`/api/carts/${cartId}/product/6574898c4ba22b2e935dfbc2`).set("Cookie", `CookieUser=${token}`);
      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.cartMod).to.exist
      expect(respuesta._body.cartMod.products).to.deep.equal([]) 
    })

    it('Prueba endpoint DELETE /api/carts/:cid => Elimina todos los productos del carrito que llega por parametro', async function () {
      await requester.post(`/api/carts/${cartId}/product/6574898c4ba22b2e935dfbc2`).set("Cookie", `CookieUser=${token}`);

      await requester.post(`/api/carts/${cartId}/product/6574898c4ba22b2e935dfbb9`).set("Cookie", `CookieUser=${token}`);

      let carro = await requester.post(`/api/carts/${cartId}/product/6574898c4ba22b2e935dfbc3`).set("Cookie", `CookieUser=${token}`);
      let respuesta = await requester.delete(`/api/carts/${cartId}`).set("Cookie", `CookieUser=${token}`);

      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.cartMod).to.exist
      expect(respuesta._body.cartMod.products).to.deep.equal([])
    })

    it('Prueba endpoint PUT /api/carts/:cid => Recibe mediante el body un objeto donde tengra una clave, valor, que modificara el carrito obtenido por params', async function () {
      let userADMIN = {
        first_name: "Aguss",
        last_name: "Lovera",
        age: 20,
        email: "testing@testingADMIN.com",
        password: "wwwPPP",
        rol: "Admin",
      };
      let tokenADMIN = await genToken(userADMIN)
      let title = 'Carrito Supertest MODIFICADO TEST'
      let respuesta = await requester.put(`/api/carts/${cartId}`).send({
        title: title
      }).set("Cookie", `CookieUser=${tokenADMIN}`);

      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.putCart).to.exist
      expect(respuesta._body.putCart.acknowledged).to.be.true
    })

    it('Prueba endpoint PUT /api/carts/:cid/product/:pid => Recibe un carrito y un producto por params, y recibira por medio del request body, el campo: quantity, para modificar la cantidad de ese producto en carrito', async function () {
      let prodHarcod = '6574898c4ba22b2e935dfbc2'
      await requester.post(`/api/carts/${cartId}/product/${prodHarcod}`).set("Cookie", `CookieUser=${token}`);
      let respuesta = await requester.put(`/api/carts/${cartId}/product/${prodHarcod}`).send({
        quantity: 5
      }).set("Cookie", `CookieUser=${token}`);

      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.cartMod.products[0].quantity).to.be.equal(5)
    })


    it('Prueba endpoint POST /api/carts/:cid/purchase => REcibe un carrito por params, y realiza el proceso dew finalizacion de compra, devuelve el ticket de compra', async function () {
      let respuesta = await requester.post(`/api/carts/${cartId}/purchase`).set("Cookie", `CookieUser=${token}`)


      expect(respuesta.statusCode).to.be.equal(200)
      expect(respuesta.ok).to.be.true
      expect(respuesta._body.ticket).to.exist
      expect(respuesta._body.ticket.purchaser).to.be.equal(user.email)
    })
  })
})