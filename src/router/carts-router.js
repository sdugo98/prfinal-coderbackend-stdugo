import { Router } from "express";
import multer from "multer";
import { io } from "../app.js";

import { passportCall, securityAcces } from "../utils.js";
import { CartsController } from "../controller/cartsController.js";
export const router = Router();
const upload = multer();

router.post("/:cid/product/:pid", passportCall('jwt'),securityAcces(["user", "premiun"]),CartsController.addProductInCart);

router.post("/", passportCall('jwt'),upload.none(), securityAcces(["admin"]),CartsController.createCart);

router.delete("/:cid/product/:pid",  passportCall('jwt'),securityAcces(["public"]),CartsController.deleteProductInCart);

router.delete("/:cid", passportCall('jwt'),securityAcces(["admin", "premiun"]),CartsController.deleteAllProductsInCart);

router.put("/:id", passportCall('jwt'),securityAcces(["admin"]),CartsController.updateCart);

router.put("/:cid/product/:pid", passportCall('jwt'),securityAcces(["public"]),CartsController.modifiedProductInCart);

router.post("/:cid/purchase", passportCall('jwt'),upload.none(), securityAcces(["public"]),CartsController.confirmBuy);
