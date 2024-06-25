import {
    Router
  } from "express";
  import multer from "multer";
  import { passportCall, securityAcces, uploadDocs, uploadProfile, uploadProduct, validDocsMiddleware  } from "../utils.js";
  import { UserController } from "../controller/userController.js";
  import { __dirname } from "../utils.js";
  export const router = Router();
  const upload = multer()


router.post("/premiun", passportCall('jwt'),upload.none(),securityAcces(["admin", "premiun", "user"]),validDocsMiddleware,UserController.changeRol);

router.post('/:uid/documents', passportCall('jwt'),securityAcces(["admin", "premiun", "user"]), uploadDocs.single("document"),UserController.uploadDocs)

 router.post('/:uid/profile', passportCall('jwt'),securityAcces(["admin", "premiun", "user"]),uploadProfile.single('profile'), UserController.uploadProfile)

router.post('/:uid/product', passportCall('jwt'),securityAcces(["admin", "premiun", "user"]),uploadProduct.single('product'),UserController.uploadProduct) 

router.get('/email',passportCall('jwt'),securityAcces(["admin", "premiun", "user"]), async (req, res) =>{
let email = req.user.email
let user = await UserController.getUser(req,res,email)
return res.status(200).json({ user})
})