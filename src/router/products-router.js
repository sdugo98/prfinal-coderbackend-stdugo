import {
  Router
} from "express";
import multer from "multer";
import { passportCall, securityAcces } from "../utils.js";
import { ProductsController } from "../controller/productsController.js";
export const router = Router();


const upload = multer();

router.post("/", passportCall('jwt'),upload.none(), securityAcces(["admin", "premiun"]),ProductsController.createProduct);

router.put("/:id", passportCall('jwt') , securityAcces(["public"]),ProductsController.updateProduct);

router.delete("/:id", passportCall('jwt'),securityAcces(["admin", "premiun"]),ProductsController.deleteProduct);
