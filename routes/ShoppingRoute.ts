import express, { Request, Response, NextFunction } from "express";
import { GetFoodAvailability, GetFoodsIn30Mins, GetRestaurantById, GetTopRestaurants, SearchFoods } from "../controllers";

const router = express.Router();

// Food Availability
router.get("/:pincode" , GetFoodAvailability);

// Top Restaurants
router.get("/top-restaurants/:pincode" , GetTopRestaurants);

// Food Available in 30 mins
router.get("/food-in-30-min/:pincode" , GetFoodsIn30Mins);

// Search Foods
router.get("/search/:pincode" , SearchFoods);

// Find Restaurant by ID
router.get("/restaurant/:id" , GetRestaurantById);

export { router as ShoppingRoute };