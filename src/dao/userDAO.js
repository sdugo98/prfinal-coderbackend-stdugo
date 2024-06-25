import { hashearPass } from "../utils.js";
import { CustomError } from "../utils/customError.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";
import { userModel } from "./models/usersModel.js";

export class UserDAO {
  constructor() { }

  async getUserById(userId) {

    let getUser;
    try {
      getUser = await userModel.findOne({ _id: userId });

      return getUser;
    } catch (error) {
      return CustomError.CustomError(
        "NO SE ENCONTRO USUARIO",
        "NO SE ENCONTRO USUARIO",
        STATUS_CODES.ERROR_DATOS_ENVIADOS,
        ERRORES_INTERNOS.OTROS
      );
    }
  }

  async changeRol(user, rol) {
    let id = user._id;
    try {
      let userMod = await userModel.updateOne({ _id: id }, { rol: rol });
      if (userMod.modifiedCount > 0) {

        return userMod;
      } else {

        return null;
      }
    } catch (error) {
      return CustomError.CustomError(
        "ERROR",
        "ERROR AL MODIFICAR",
        STATUS_CODES.ERROR_DATOS_ENVIADOS,
        ERRORES_INTERNOS.OTROS
      );
    }
  }

  async getUser(email) {
    try {
      let user = await userModel.findOne({ email }).lean()
      if (!user) {

        return null;
      }
      return user;
    } catch (error) {
      return null
    }
  }

  async updatePassUser(pass, email) {
    try {

      let user = await this.getUser(email);
      if (!user) {
        return null
      }
      let hashPass = hashearPass(pass);
      if (!hashPass) {
        return null
      }

      let updatedUser = await userModel.updateOne(
        { email: email },
        { password: hashPass }
      );
      if (!updatedUser) {
        return null
      }

      return updatedUser
    } catch (error) {
      return null
    }
  }

  async putUser(id) {
    let user = await this.getUserById(id)
    if (!user) {
      return null
    }
    let date = new Date()
    let userMod = await userModel.updateOne({ _id: id }, { last_connection: date })
    if (!userMod) {
      return null
    }
    return true
  }



  async pushDoc(userId, nameFile, pathFile) {
    let user = await this.getUserById(userId)
    if (!user) {
      return null
    }
    let newDoc = {
      name: nameFile,
      reference: pathFile
    }
    let userPush = await userModel.updateOne({ _id: userId }, { $push: { documents: newDoc } })
    return userPush
  }

}
