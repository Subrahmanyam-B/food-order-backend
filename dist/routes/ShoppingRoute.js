"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppingRoute = void 0;
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
exports.ShoppingRoute = router;
// Food Availability
router.get("/:pincode", controllers_1.GetFoodAvailability);
// Top Restaurants
router.get("/top-restaurants/:pincode", controllers_1.GetTopRestaurants);
// Food Available in 30 mins
router.get("/food-in-30-min/:pincode", controllers_1.GetFoodsIn30Mins);
// Search Foods
router.get("/search/:pincode", controllers_1.SearchFoods);
// Find Restaurant by ID
router.get("/restaurant/:id", controllers_1.GetRestaurantById);
// Find Offers
router.get("/offers/:pincode", controllers_1.GetAvailableOffers);
//# sourceMappingURL=ShoppingRoute.js.map