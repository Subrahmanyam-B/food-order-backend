"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
exports.DeliveryRoute = router;
// SingnUp or Create Cutomer
router.post("/signup", controllers_1.DeliverySignUp);
// Login
router.post("/login", controllers_1.DeliveryLogin);
//  Authentication
// The below routes are not public , we need to authenticate first
router.use(middlewares_1.Authenticate);
// Change Status
router.put("/change-status", controllers_1.UpdateDeliveryStatus);
//Profile
router.get("/profile", controllers_1.GetDeliveryProfile);
router.patch("/profile", controllers_1.UpdateDeliveryProfile);
//# sourceMappingURL=DeliveryRoute.js.map