import { Request, Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Delivery, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utilities";

export const findVendor = async (id: string | undefined, email?: string) => {
  if (email) {
    return await Vendor.findOne({ email: email });
  } else {
    return await Vendor.findById(id);
  }
};

export const CreateVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    name,
    address,
    phone,
    email,
    pincode,
    foodType,
    password,
    ownerName,
  } = <CreateVendorInput>req.body;

  const existingVendor = await findVendor("", email);

  if (existingVendor !== null) {
    return res.json({
      message: "A vendor with the same emailID already exist",
    });
  }

  //generate a salt

  const salt = await GenerateSalt();
  const userpassword = await GeneratePassword(password, salt);
  //encrypt with the salt

  const createdVendor = await Vendor.create({
    name: name,
    address: address,
    phone: phone,
    pincode: pincode,
    ownerName: ownerName,
    foodType: foodType,
    email: email,
    password: userpassword,
    salt: salt,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    lat: 0,
    lng: 0,
  });

  return res.json(createdVendor);
};

export const GetVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }

  return res.json({ message: "Vendors Data not available" });
};

export const GetVendorByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const vendorId = req.params.id;

  const vendor = await findVendor(vendorId);

  if (vendor !== null) {
    return res.json(vendor);
  }

  return res.json({ message: "Vendors Data not available" });
};

export const VerifyDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { deliveryId, status } = req.body;

  const deliveryProfile = await Delivery.findById(deliveryId);

  if (deliveryProfile) {
    deliveryProfile.verified = status;

    const result = await deliveryProfile.save();

    return res.status(200).json(result);
  }

  return res.status(400).json({ message: "Delivery User not found" });
};

export const GetDeliveryUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryUsers = await Delivery.find();

  if (deliveryUsers !== null) {
    return res.status(200).json(deliveryUsers);
  }

  return res.status(400).json({ message: "Delivery User not found" });
};
