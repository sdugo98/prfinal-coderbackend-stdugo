import { Router } from "express";
import { productsModel } from "../dao/models/productsModel.js";
import { genToken, passportCall, securityAcces, validDocsMiddleware } from "../utils.js";
import { currentDTO } from "../DTO/currentDTO.js";
import { ProductsController } from "../controller/productsController.js";
import { CartsController } from "../controller/cartsController.js";
import { ticketService } from "../services/ticket.Service.js";
import { Mocking } from '../controller/mockingController.js'
import { ERRORES_INTERNOS, STATUS_CODES } from "../utils/tiposError.js";
import { CustomError } from "../utils/customError.js";
import { UserController } from "../controller/userController.js";
import { stripeInstance } from "../app.js";
import { v4 } from "uuid";
import { sendMail } from "../mails/mails.js";


export const router = Router();

router.get("/", async (req, res) => {
  try {
    res.status(200).render("index");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

router.get('/registro', (req, res) => {
  let { error } = req.query

  res.status(200).render('register', { error });
});

router.get('/login', (req, res) => {
  let { error, message } = req.query
  res.status(200).render('login', { error, message });
});

router.get('/current', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  let user = req.user
  if (!user.first_name) {
    user = user._doc
    res.clearCookie('CookieUser')
    let token = await genToken(user)
    res.cookie('CookieUser', token, { httpOnly: true, maxAge: 1000 * 60 * 60 });
    return res.status(200).render('perfil', { user });
  }
  user = await currentDTO(user)
  res.status(200).render('perfil', { user });

});

router.post('/user', passportCall('jwt'), securityAcces(["admin", "premiun", "user"]), async (req, res) => {
  let email = req.body.email
  let user = await UserController.getUser(req, res, email)
  if (!user) {
    return res.status(404).json({ error: 'Error al recuperar el usuario' })
  }
  return res.status(200).json({ user })
})


router.get('/products', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  try {
    const renderData = await ProductsController.renderData(req);
    req.logger.info('RENDER')
    if (!renderData) {
      let error = CustomError.CustomError('ERROR AL RENDERIZAR PRODUCTOS', 'ERROR INTERNO', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.DATABASE)
      return res.status(404).render('errorHandlebars', { error });
    }
    res.render('viewProducts', renderData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/products/:id', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  try {
    const renderProductById = await ProductsController.getProductById(req)
    if (!renderProductById) {
      req.logger.error('NO SE ENCONTRO PRODUCTO POR ID')
      let error = CustomError.CustomError('ERROR EN DATOS', 'NO SE ENCONTRO PRODUCTO', STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS)
      return res.status(404).render('errorHandlebars', { error });
    }
    res.status(200).render("viewDetailProduct", renderProductById);
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})

router.get('/carts', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  try {
    const renderCart = await CartsController.render(req)
    if (!renderCart) {
      req.logger.fatal('ERROR AL RENDERIZAR CARRITOS')
      let error = CustomError.CustomError('ERROR AL RENDERIZAR CARRITOS', 'ERROR INTERNO', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.DATABASE)
      return res.render('errorHandlebars', { error })
    }
    res.render('viewCarts', renderCart)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})
router.get('/carts/:id', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  try {
    const cart = await CartsController.getCartById(req);
    if (!cart) {
      req.logger.error('NO SE ENCONTRO CARRITO POR ID')
      let error = CustomError.CustomError('ERROR EN DATOS', 'NO SE ENCONTRO CARRITO', STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS)
      return res.render('errorHandlebars', { error })
    }
    cart.products.forEach(prod => {
      prod.subtotal = (prod.product.price * prod.quantity).toFixed(2)
    });

    const total = cart.products.reduce((acc, prod) => acc + parseFloat(prod.subtotal), 0).toFixed(2);

    return res.render('viewDetailCarts', { cart, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/purchase/:tid', passportCall('jwt'), securityAcces(["public"]), async (req, res) => {
  let { tid } = req.params
  if (!tid) {
    let error = CustomError.CustomError('ERROR INTERNO', 'ERROR AL RECUPERAR LA ORDEN, CONTACTE CON EL ADMIN', STATUS_CODES.ERROR_SERVER, ERRORES_INTERNOS.INTERNAL)
    return res.render('errorHandlebars', { error })
  }
  let ticket = await ticketService.getTicketByID(tid)

  let message = `Informe de compra
  Total: ${ticket.amount}`
  let rta = await sendMail(req.user.email, "Confirmacion de compra", message)
  if (rta.accepted.length < 0) {
    return res.status(500).json({ error: 'Error interno para finalizar la compra, Contacte urgente un Administrador' })
  }
  res.render('ticket', { ticket })
})



router.get('/api/users/premiun/:uid', passportCall('jwt'), securityAcces(["public"]), validDocsMiddleware, async (req, res) => {
  try {
    let user = await UserController.getUserById(req)
    if (!user) {
      let error = CustomError.CustomError('ERROR ARGUMENTOS', 'NO SE ENCONTRO USUARIO CON EL ID INGRESADO', STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS)
      return res.render('errorHandlebars', { error })
    }
    res.render('userRol', { user: user })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
})


router.get('/users/premiun/:uid/documents', passportCall('jwt'), securityAcces(["user", "admin", "premiun"]), async (req, res) => {
  try {
    let user = await UserController.getUserById(req)
    if (!user) {
      let error = CustomError.CustomError('ERROR ARGUMENTOS', 'NO SE ENCONTRO USUARIO CON EL ID INGRESADO', STATUS_CODES.ERROR_ARGUMENTOS, ERRORES_INTERNOS.ARGUMENTOS)
      return res.render('errorHandlebars', { error })
    }
    res.render('userDocs', { user })
  } catch (error) {

  }
})
router.get('/pagos/:total', passportCall('jwt'), securityAcces(["user", "premiun"]), async (req, res) => {
  let { total } = req.params

  return res.status(200).render('pP', { total: total })
})



router.post('/pagos', passportCall('jwt'), securityAcces(["user", "premiun"]), async (req, res) => {
  let { importe } = req.body
  if (!importe || importe < 1 || isNaN(importe)) {
    return res.status(404).json({ error: 'No se envio un importe correcto' })
  }

  let ticket = await ticketService.createTicket({ code: v4(), amount: importe, purchaser: req.user.email });
  req.ticket = ticket
  if (!ticket) {
    return res.status(500).json({ error: "error al generar ticket" });
  }

  const paymentIntent = await stripeInstance.paymentIntents.create({
    amount: importe,
    currency: 'usd',
    metadata: {
      ticketId: ticket._id.toString(),
    },
  });

  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(paymentIntent);

})

router.get('/restablecerPass', (req, res) => {
  let { error, message } = req.query

  res.render('rstPass', { error, message })
})
router.get('/restPass2', async (req, res) => {
  let { token } = req.query

  res.render('rstPass2', { token })
})


router.get('/support', passportCall('jwt'), securityAcces(["admin"]), (req, res) => {
  res.render('support')
})


router.get('/errorHandlebars', securityAcces(["public"]), (req, res) => {
  let { error } = req.query
  res.render('errorHandlebars', { error })
})
router.get('/mockingproducts', passportCall('jwt'), securityAcces(["admin"]), async (req, res) => {
  let fakeProducts = await Mocking.genProd()
  let error

  res.render('mockingProducts', { error, fakeProducts })
})


router.get('/errorServer', securityAcces(["public"]), (req, res) => {
  res.render('errorServer')
})

router.get('/loggerTest', securityAcces(["public"]), (req, res) => {
  req.logger.debug('Debug message');
  req.logger.http('HTTP message');
  req.logger.info('Info message');
  req.logger.warning('Warning message');
  req.logger.error('Error message');
  req.logger.fatal('Fatal message');
  return res.status(200).json({ message: 'TESTEANDO LOGS EN CONSOLA' });
});


router.get('*', securityAcces(["public"]), (req, res) => {
  res.render('404')
})
