import express, { Request, Response, NextFunction } from "express";
import {
  CreateVendor,
  GetDeliveryUser,
  GetVendorByID,
  GetVendors,
  VerifyDeliveryUser,
} from "../controllers";

const router = express.Router();

router.post("/vendor", CreateVendor);

router.get("/vendors", GetVendors);

router.get("/vendor/:id", GetVendorByID);

router.put("/verify-delivery", VerifyDeliveryUser);

router.get("/delivery-users", GetDeliveryUser);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "Hello from Admin" });
});

export { router as AdminRoute };
