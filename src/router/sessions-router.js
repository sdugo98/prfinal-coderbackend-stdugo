import { Router } from "express";
import { userModel } from "../dao/models/usersModel.js";
import passport from "passport";
import { genToken, hashearPass, passportCall, securityAcces, validPassword } from "../utils.js";
import { UserController } from "../controller/userController.js";
import jwt from 'jsonwebtoken'
import { TOKENKEY } from "../utils.js";
import { sendMail } from "../mails/mails.js";
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";
import { CustomError } from "../utils/customError.js";

export const router = Router();

router.post('/registro',passportCall('register'),async(req,res)=>{
try {
  if(req.error){
    return res.redirect(`/registro/?error=${req.error}`)
    }
    res.redirect('/login')
} catch (error) {
  return redirect('/errorServer')
}})

router.post('/login', passportCall('login'), async (req, res) => {
  if (req.error) {
      return res.status(400).redirect(`/login/?error=${req.error}`);
  }
  let id = req.user._id
  let last_connection = await UserController.last_connection(req,res,id)
  let error  =  CustomError.CustomError('ERROR SERVER', 'ERROR INTERNO', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.DATABASE)
  if(!last_connection){ return res.status(404).render('errorHandlebars', { error })
}
  let token = genToken(req.user);
  res.cookie('CookieUser', token, { httpOnly: true, maxAge: 1000 * 60 * 60 });
  res.redirect('/current');
});




router.get('/github',passportCall('github', {}), (req,res)=>{})
router.get('/githubcallback',passportCall('github'),
  (req,res)=>{
    let user = req.user
    let token = genToken(user)
    res.cookie('CookieUser', token, {httpOnly:true, maxAge:1000*60*60})
    res.redirect('/current')
  })


  router.get('/logout',passportCall('jwt'),async(req,res)=>{
    let id = req.user._id
    if(!req.user._id || req.user._id === undefined){
      let user = await UserController.getUser(req,res,req.user.email)
      if(!user){
        let error  =  CustomError.CustomError('ERROR', 'ERROR AL RECUPERAR USUARIO', STATUS_CODES.ERROR_DATOS_ENVIADOS, ERRORES_INTERNOS.ARGUMENTOS)
        return res.status(404).render('errorHandlebars', { error })
      }
      id = user._id
    }
    let last_connection = await UserController.last_connection(req,res,id)
    let error  =  CustomError.CustomError('ERROR SERVER', 'ERROR INTERNO', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.DATABASE)
    if(!last_connection){
      return res.status(404).render('errorHandlebars', { error })
  }
    res.clearCookie('CookieUser')
    res.redirect('/login')
  })

  router.post('/restPass1',async(req,res)=>{
    let {email} = req.body
    if(!email){
      let error = CustomError.CustomError(
        "DATOS INCOMPLETOS",
        "INGRESE UN MAIL",
        STATUS_CODES.ERROR_DATOS_ENVIADOS,
        ERRORES_INTERNOS.ARGUMENTOS
      );
      return res.render("rstPass", { error });
    }
    let user = await UserController.getUser(req, res,email)
    if(!user){
      let error = CustomError.CustomError(
        "ERROR EN DATOS",
        "NO SE ENCONTRO UN USUARIO REGISTRADO CON ESE EMAIL",
        STATUS_CODES.ERROR_DATOS_ENVIADOS,
        ERRORES_INTERNOS.ARGUMENTOS
      );
      return res.render("rstPass", { error });
    }
    delete user.password
    let token = genToken(user)
    if(!token){
      let error = CustomError.CustomError(
        "SERVER ERROR",
        "NO SE PUDO GENERAR JWT, CONTACTE ADMINISTRADOR",
        STATUS_CODES.ERROR_SERVER,
        ERRORES_INTERNOS.INTERNAL
      );
      return res.render("rstPass", { error });
    }

    let message= `Usted a solicitado reestablecer su contraseña.<br><br><hr>
    -Haga click en el siguiente enlace para continuar: <a href="http://localhost:8080/api/sessions/restPass2?token=${token}">REESTABLECER CONTRASEÑA</a><br><br><hr>
    
    El enlace es valido solo por 1 HORA (60 minutos).
    Si no es utilizado el enlace expirara, y debera generar un enlace nuevo.`

    let rta =await sendMail(email, "REESTABLECER CONTRASEÑA", message)
    
    if(rta.accepted.length > 0){
      res.redirect('http://localhost:8080/restablecerPass?message=Email enviado. Verifique su correo electronico.')
    }else{
      res.redirect('http://localhost:8080/restablecerPass?error=Error interno intente mas tarde')
    }
  })


  router.get('/restPass2',async(req,res)=>{
    let {token} = req.query
    try {
      let contentToken;
      try {
          contentToken = jwt.verify(token, TOKENKEY);
      } catch (error) {
          if (error.name === 'TokenExpiredError') {
            let error = CustomError.CustomError(
              "ERROR",
              "EXPIRO TOKEN",
              STATUS_CODES.ERROR_DATOS_ENVIADOS,
              ERRORES_INTERNOS.ARGUMENTOS
            );
            return res.render("rstPass", { error });
          } else {
              return res.status(500).render('errorServer');
          }
      }
      res.redirect(`http://localhost:8080/restPass2?token=${token}`)
    } catch (error) {
      return res.status(500).json({error: error})
    } 
  })


  router.post('/restPass3', async (req,res)=>{
    let {pass} = req.body
    let {token} = req.query
let contentToken;

    try {
        contentToken = jwt.verify(token, TOKENKEY);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
          let error = CustomError.CustomError(
            "ERROR",
            "EXPIRO TOKEN",
            STATUS_CODES.ERROR_DATOS_ENVIADOS,
            ERRORES_INTERNOS.ARGUMENTOS
          );
          return res.render("rstPass", { error });
        } else {
            return res.status(500).render('errorServer');
        }
    }

    let updatePassUser = await UserController.updatePassUser(res, pass, contentToken.email)
if(!updatePassUser){
  let error = CustomError.CustomError(
    "SERVER ERROR",
    "ERROR INTERNO, CONTACTE ADMINISTRADOR",
    STATUS_CODES.ERROR_SERVER,
    ERRORES_INTERNOS.INTERNAL
  );
  return res.render("errorHandlebars", { error });
}

return updatePassUser
  })