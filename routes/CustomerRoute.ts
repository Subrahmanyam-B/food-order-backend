import express, { Request, Response, NextFunction } from "express";
import { CustomerLogin, CustomerSignUp, VerifyCustomer } from "../controllers";

const router = express.Router();

// SingnUp or Create Cutomer

router.post('/signup', CustomerSignUp)

// Login
router.post('/login' , CustomerLogin)

//  Authentication
// The below routes are not public , we need to authenticate first

//Verify Customer
router.patch('/verify' , VerifyCustomer)

// OTP / Requesting OTP
router.get('/otp')

//Profile

router.get('/profile')
router.patch('/profile')

// Cart Section
//Order
//Payment

export { router as CustomerRoute };
