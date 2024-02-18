import express, { Request, Response, NextFunction } from "express";
import {
  CreateOrder,
  CustomerLogin,
  CustomerSignUp,
  GetCustomerProfile,
  GetOrderById,
  GetOrders,
  RequestOtp,
  UpdateCustomerProfile,
  VerifyCustomer,
  addToCart,
  deleteCart,
  getCart,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

// SingnUp or Create Cutomer

router.post("/signup", CustomerSignUp);

// Login
router.post("/login", CustomerLogin);

//  Authentication
// The below routes are not public , we need to authenticate first

router.use(Authenticate);

//Verify Customer
router.patch("/verify", VerifyCustomer);

// OTP / Requesting OTP
router.get("/otp", RequestOtp);

//Profile

router.get("/profile", GetCustomerProfile);
router.patch("/profile", UpdateCustomerProfile);

// Cart Section

router.get('/cart', getCart);
router.post('/cart', addToCart);
router.delete('/cart', deleteCart);

//Order

router.post("/create-order", CreateOrder);
router.get("/orders", GetOrders);
router.get("/order/:id", GetOrderById);

//Payment

export { router as CustomerRoute };
