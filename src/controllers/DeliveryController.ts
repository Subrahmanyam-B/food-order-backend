import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CreateDeliveryUserInputs,
  EditCustomerProfileInputs,
  UserLoginInputs,
} from "../dto";
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  onRequestOtp,
} from "../utilities";
import { Customer, Delivery } from "../models";

export const DeliverySignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deliveryInputs = plainToClass(CreateDeliveryUserInputs, req.body);

  const inputErrors = await validate(deliveryInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password, firstName, lastName, address, pincode } =
    deliveryInputs;

  const salt = await GenerateSalt();

  const userpassword = await GeneratePassword(password, salt);

  const existingDelivery = await Delivery.findOne({ email: email });

  if (existingDelivery !== null) {
    return res
      .status(409)
      .json({ message: "An delivery user exist with the following email ID" });
  }

  const result = await Delivery.create({
    email: email,
    password: userpassword,
    phone: phone,
    salt: salt,
    firstName: firstName,
    lastName: lastName,
    address: address,
    pincode: pincode,
    verified: false,
    lat: 0,
    lng: 0,
    isAvailable: false,
  });

  if (result) {
    //generate signature
    const signature = GenerateSignature({
      _id: result._id as string,
      email: result.email,
      verified: result.verified,
    });
    //send the result to the client

    return res.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email,
    });
  }

  return res.status(400).json({ message: "Error with Signup" });
};
export const DeliveryLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const loginInputs = plainToClass(UserLoginInputs, req.body);

  console.log(loginInputs);

  const loginErrors = await validate(loginInputs, {
    validationError: { target: false },
  });

  if (loginErrors.length > 0) {
    return res.status(400).json(loginErrors);
  }

  const { email, password } = loginInputs;
  console.log(email);
  const deliveryUser = await Delivery.findOne({ email: loginInputs.email });

  if (deliveryUser) {
    const validation = await ValidatePassword(
      password,
      deliveryUser.password,
      deliveryUser.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: deliveryUser._id as string,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });

      //send the result to the client

      return res.status(201).json({
        signature: signature,
        email: deliveryUser.email,
        verified: deliveryUser.verified,
      });
    } else {
      return res.status(400).json({ message: "Error with password " });
      // password does not match
    }
  }

  return res.status(404).json({ message: "Error with Login" });
};

export const GetDeliveryProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const profile = await Delivery.findById(user._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  return res.status(404).json({ message: "Error getting profile" });
};

export const UpdateDeliveryProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);
  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });
  const { firstName, lastName, address, pincode } = profileInputs;
  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }
  if (user) {
    const profile = await Delivery.findById(user._id);
    if (profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.address = address;
      profile.pincode = pincode;
      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.status(404).json({ message: "Error updating profile" });
};

export const UpdateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user) {
    const { lat, lng } = req.body;

    const profile = await Delivery.findById(user._id);

    if (profile) {
      if (lat && lng) {
        profile.lat = lat;
        profile.lng = lng;
      }
      profile.isAvailable = !profile.isAvailable;

      const result = await profile.save();
      return res.status(200).json(result);
    }
  }
  return res.status(404).json({ message: "Error updating profile" });
};
