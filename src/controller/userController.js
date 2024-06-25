import mongoose from "mongoose";
import { io } from "../app.js";
import { productsService } from "../services/products.Service.js";
import { ticketService } from "../services/ticket.Service.js";
import { v4 } from "uuid";
import { CustomError } from "../utils/customError.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";
import { userService } from "../services/user.Service.js";
import bcrypt from "bcrypt";
import { validPassword } from "../utils.js";
import { uploadDocs, uploadProfile } from "../utils.js";




function idValid(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return CustomError.CustomError('Error al validar ID', 'ID Invalido', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.OTROS);
  }
}


export class UserController {
  constructor() { }
  static async getUserById(req, res) {
    try {
      let { uid } = req.params;
      let valid = idValid(uid, res);
      if (valid) {
        return res.status(404).json({ error: 'Error al recuperar usuario' });
      }

      let getUser = await userService.getUserById(uid);
      if (!getUser) {
        return res.status(404).json({ error: 'Error al recuperar usuario' });
      }
      return getUser
    } catch (error) {
      return res.status(500).json({
        error: error.message
      });
    }
  }

  static async changeRol(req, res, rol) {
    try {

      let user = req.user
      let { rol } = req.body
      if (!rol, !user) {
        return res.status(500).json({ error: 'ERROR INTERNO' })
      }
      let userMod = await userService.changeRol(user, rol)
      if (!userMod) {
        return res.status(500).json({ error: 'ERROR INTERNO' })
      }

      return res.status(200).json({ userMod })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  static async getUser(req, res, email) {

    let user = await userService.getUser(email)
    if (!user) {
      return null
    }
    return user
  }


  static async updatePassUser(res, pass, email) {
    let user = await userService.getUser(email);
    if (!user) {
      return res.status(404).json({ error: 'Error al recuperar usuario' });
    }

    let validPass = validPassword(user, pass)
    if (validPass === true) {
      return res.status(403).json({ error: 'Contraseña registrada en BD, restablecimiento rechazado' });
    }

    let updatedUser = await userService.updatePassUser(pass, email);
    if (!updatedUser) {
      return res.status(500).json({ error: 'ERROR INTERNO CONTACTE AL ADMINISTRADOR' });
    }
    return res.status(200).json({ message: 'Cambio realizado con exito' })
  }

  static async last_connection(req, res, id) {
    let putUser = await userService.putUser(id)
    if (!putUser) {
      return null
    }
    return true
  }

  static async uploadDocs(req, res, next) {
    const userId = req.params.uid;
    const typeDoc = req.body.documentType;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.render('errorHandlebars', { error: 'Error al recuperar el usuario' });
    }

    if (!req.file) {
      return res.render('userDocs', { user: user, error: 'Debe cargar un documento' });
    }

    try {
      let nameFile = `${typeDoc}`;
      let pathFile = req.file.path;

      const pushDoc = await userService.pushDoc(userId, nameFile, pathFile);
      if (!pushDoc) {
        return res.render('userDocs', { user: user, error: 'Error interno - intente más tarde' });
      }

      return res.render('userDocs', { user: user, message: `${nameFile} Cargado correctamente` });
    } catch (error) {
      next(error);
      return res.render('userDocs', { user: user, error: error.message });
    }
  }

  static async uploadProfile(req, res, next) {
    const userId = req.params.uid;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.render('userDocs', { user: user, error: 'Error al recuperar el usuario' });
    }

    if (!req.file) {
      return res.render('userDocs', { user: user, error: 'Debe cargar un documento' });
    }

    return res.render('userDocs', { user: user, message: `${req.file.originalname} Cargado correctamente` });
  }

  static async uploadProduct(req, res, next) {
    const userId = req.params.uid;
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.render('userDocs', { user: user, error: 'Error al recuperar el usuario' });
    }

    if (!req.file) {
      return res.render('userDocs', { user: user, error: 'Debe cargar un documento' });
    }

    return res.render('userDocs', { user: user, message: `${req.file.originalname} Cargado correctamente` });
  }
}