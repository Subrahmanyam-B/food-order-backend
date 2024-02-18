import { Request, Response, NextFunction } from "express";
import { EditVendorInputs, VendorLoginInput } from "../dto";
import { findVendor } from "./AdminController";
import { GenerateSignature, ValidatePassword } from "../utilities";
import { CreateFoodInputs } from "../dto/Food.dto";
import { Food } from "../models";

export const VendorLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = <VendorLoginInput>req.body;

  const existingVendor = await findVendor("", email);

  if (existingVendor !== null) {
    //validations and give access

    const validation = await ValidatePassword(
      password,
      existingVendor.password,
      existingVendor.salt,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
  next: NextFunction,
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
