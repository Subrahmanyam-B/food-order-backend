import express, { Application } from "express";

import {
  AdminRoute,
  VendorRoute,
  ShoppingRoute,
  CustomerRoute,
} from "../routes";
import { DeliveryRoute } from "../routes/DeliveryRoute";

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(__dirname));

  app.use("/admin", AdminRoute);
  app.use("/vendor", VendorRoute);
  app.use("/customer", CustomerRoute);
  app.use(ShoppingRoute);
  app.use("/delivery", DeliveryRoute);

  return app;
};
