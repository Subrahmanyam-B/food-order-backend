import express, { Application } from "express";

import {
  AdminRoute,
  VendorRoute,
  ShoppingRoute,
  CustomerRoute,
} from "../routes";

export default async (app: Application) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(__dirname));

  app.use("/admin", AdminRoute);
  app.use("/vendor", VendorRoute);
  app.use("/customer", CustomerRoute);
  app.use(ShoppingRoute);

  return app;
};

