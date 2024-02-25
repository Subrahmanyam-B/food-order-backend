import express from "express";
import {
  DeliveryLogin,
  DeliverySignUp,
  GetDeliveryProfile,
  UpdateDeliveryProfile,
  UpdateDeliveryStatus,
} from "../controllers";
import { Authenticate } from "../middlewares";

const router = express.Router();

// SingnUp or Create Cutomer

router.post("/signup", DeliverySignUp);

// Login
router.post("/login", DeliveryLogin);

//  Authentication
// The below routes are not public , we need to authenticate first

router.use(Authenticate);

// Change Status

router.put("/change-status", UpdateDeliveryStatus);

//Profile

router.get("/profile", GetDeliveryProfile);
router.patch("/profile", UpdateDeliveryProfile);

export { router as DeliveryRoute };
