import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInput } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utilities";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models";
import { Order } from "../models/Order";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = <VendorLoginInput>req.body;

  const existingVendor = await findVendor("", email);

  if (existingVendor !== null) {
    //validations and give access

    const validation = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: existingVendor._id,
        email: existingVendor.email,
        name: existingVendor.name,
        foodType: existingVendor.foodType,
      });

      return res.json({ token: signature });
    } else {
      return res.json({ message: "Password is invalid" });
    }
  }

  return res.json({ message: "Invalid login credentials" });
};

export const GetVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingVendor = await findVendor(user._id);

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor Information not found" });
};

export const UpdateVendorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, foodType, phone, address } = <EditVendorInputs>req.body;

  const user = req.user;

  if (user) {
    const existingVendor = await findVendor(user._id);

    if (existingVendor !== null) {
      existingVendor.name = name;
      existingVendor.foodType = foodType;
      existingVendor.phone = phone;
      existingVendor.address = address;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor Information not found" });
};

export const UpdateVendorCoverImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const vendor = await findVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      vendor.coverImages.push(...images);

      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ message: "Something went wrong with add food" });
};

export const UpdateVendorService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const existingVendor = await findVendor(user._id);

    if (existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      const savedResult = await existingVendor.save();

      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({ message: "Vendor Information not found" });
};

export const AddFood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const { name, description, category, readyTime, foodType, price } = <
      CreateFoodInputs
    >req.body;

    const vendor = await findVendor(user._id);

    if (vendor !== null) {
      const files = req.files as [Express.Multer.File];

      const images = files.map((file: Express.Multer.File) => file.filename);

      const createdFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        readyTime: readyTime,
        foodType: foodType,
        price: price,
        images: images,
        rating: 0,
      });

      vendor.foods.push(createdFood);
      const result = await vendor.save();

      return res.json(result);
    }
  }

  return res.json({ message: "Something went wrong with add food" });
};

export const GetFoods = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const foods = await Food.find({
      vendorId: user._id,
    });

    if (foods !== null) {
      return res.json(foods);
    }
  }

  return res.json({ message: "Foods Information not found" });
};

export const GetCurrentOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const orders = await Order.find({ vendorId: user._id }).populate(
      "items.food"
    );

    if (orders !== null) {
      return res.status(200).json(orders);
    }
  }

  return res.status(400).json({ message: "Order not found" });
};

export const ProcessOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderID = req.params.id;

  const { status, remarks, time } = req.body;

  if (orderID) {
    const order = await Order.findById(orderID).populate("items.food");

    if (order !== null) {
      order.orderStatus = status;
      order.remarks = remarks;
      if (time) {
        order.readyTime = time;
      }
      const orderResult = await order.save();
      if (orderResult !== null) {
        return res.status(200).json(orderResult);
      }
    }
  }

  return res.status(400).json({ message: "Unable to process order" });
};
export const GetOrderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderID = req.params.id;

  if (orderID) {
    const order = await Order.find({ orderID: orderID }).populate("items.food");

    if (order !== null) {
      return res.status(200).json(order);
    }
  }
};
