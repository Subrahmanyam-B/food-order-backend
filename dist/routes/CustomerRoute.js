"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
exports.CustomerRoute = router;
// SingnUp or Create Cutomer
router.post("/signup", controllers_1.CustomerSignUp);
// Login
router.post("/login", controllers_1.CustomerLogin);
//  Authentication
// The below routes are not public , we need to authenticate first
router.use(middlewares_1.Authenticate);
//Verify Customer
router.patch("/verify", controllers_1.VerifyCustomer);
// OTP / Requesting OTP
router.get("/otp", controllers_1.RequestOtp);
//Profile
router.get("/profile", controllers_1.GetCustomerProfile);
router.patch("/profile", controllers_1.UpdateCustomerProfile);
// Cart Section
router.get("/cart", controllers_1.getCart);
router.post("/cart", controllers_1.addToCart);
router.delete("/cart", controllers_1.deleteCart);
//Offer Section
router.get("/offer/verify/:id", controllers_1.VerifyOffer);
//Order
router.post("/create-order", controllers_1.CreateOrder);
router.get("/orders", controllers_1.GetOrders);
router.get("/order/:id", controllers_1.GetOrderById);
//Payment
router.post("/create-payment", controllers_1.CreatePayment);
//# sourceMappingURL=CustomerRoute.js.map