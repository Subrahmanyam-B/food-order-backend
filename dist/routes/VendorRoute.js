"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
exports.VendorRoute = router;
const imageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, "../images/"));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});
const images = (0, multer_1.default)({ storage: imageStorage }).array("images", 10);
router.post("/login", controllers_1.VendorLogin);
router.use(middlewares_1.Authenticate);
router.get("/profile", controllers_1.GetVendorProfile);
router.patch("/profile", controllers_1.UpdateVendorProfile);
router.patch("/cover", images, controllers_1.UpdateVendorCoverImage);
router.patch("/service", controllers_1.UpdateVendorService);
router.post("/food", images, controllers_1.AddFood);
router.get("/foods", controllers_1.GetFoods);
//Orders
router.get("/orders", controllers_1.GetCurrentOrders);
router.put("/order/:id/process", controllers_1.ProcessOrder);
router.get("/orders/:id", controllers_1.GetOrderDetails);
// Transactions
router.get("/transactions", controllers_1.GetTransactions);
// Vendors
router.get("/offers", controllers_1.GetOffers);
router.post("/offer", controllers_1.CreateOffer);
router.put("/offer/:id", controllers_1.EditOffer);
//delete offer
router.get("/", (req, res, next) => {
    res.json({ message: "Hello from Vendor" });
});
//# sourceMappingURL=VendorRoute.js.map