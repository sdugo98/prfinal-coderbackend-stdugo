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
    genToken
  } from "../utils.js";
  
  const requester = supertest("http://localhost:8080");
  
  describe("PRUEBA ALTA PROYECTO", async function () {
    this.timeout(5000);
  
    before(async () => {
      try {
        await mongoose.connect(config.MONGO_URL);
      } catch (error) {
      }
    });
  
    describe("Prueba inicio de proyecto", async function () {
      it('Prueba endpoint GET / => Renderiza vista "index"', async function () {
        let respuesta = await requester
          .get("/")
        expect(respuesta.statusCode).to.be.equal(200);
        expect(respuesta.ok).to.be.true;
      });
    })
})