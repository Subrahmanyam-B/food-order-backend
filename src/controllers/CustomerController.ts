import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import {
  CartItems,
  CreateCustomerInputs,
  EditCustomerProfileInputs,
  OrderInputs,
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
import { Customer, Food, Transaction } from "../models";
import { Order } from "../models/Order";
import { Offer } from "../models/Offer";

export const CustomerSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customerInputs = plainToClass(CreateCustomerInputs, req.body);

  const inputErrors = await validate(customerInputs, {
    validationError: { target: true },
  });

  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const { email, phone, password } = customerInputs;

  const salt = await GenerateSalt();

  const userpassword = await GeneratePassword(password, salt);

  const { otp, expiry } = GenerateOtp();

  const existCustomer = await Customer.findOne({ email: email });

  if (existCustomer !== null) {
    return res
      .status(409)
      .json({ message: "An user exist with the following email ID" });
  }

  const result = await Customer.create({
    email: email,
    password: userpassword,
    phone: phone,
    salt: salt,
    otp: otp,
    otp_expiry: expiry,
    firstName: "",
    lastName: "",
    address: "",
    verified: false,
    lat: 0,
    lng: 0,
    orders: [],
  });

  if (result) {
    //send otp to the customer

    await onRequestOtp(otp, phone);

    //generate signature
    const signature = GenerateSignature({
      _id: result._id,
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
export const CustomerLogin = async (
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
  const customer = await Customer.findOne({ email: loginInputs.email });

  if (customer) {
    const validation = await ValidatePassword(
      password,
      customer.password,
      customer.salt
    );

    if (validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified,
      });

      //send the result to the client

      return res.status(201).json({
        signature: signature,
        email: customer.email,
        verified: customer.verified,
      });
    } else {
      return res.status(400).json({ message: "Error with password " });
      // password does not match
    }
  }

  return res.status(404).json({ message: "Error with Login" });
};

export const VerifyCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { otp } = req.body;

  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile !== null) {
      console.log(parseInt(otp));
      console.log(profile.otp_expiry);
      console.log(new Date());
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        console.log(profile);
        profile.verified = true;

        const updatedCustomerProfile = await profile.save();

        const signature = GenerateSignature({
          _id: updatedCustomerProfile._id,
          email: updatedCustomerProfile.email,
          verified: updatedCustomerProfile.verified,
        });

        return res.status(201).json({
          signature: signature,
          verified: updatedCustomerProfile.verified,
          email: updatedCustomerProfile.email,
        });
      }
    }

    return res.status(400).json({ message: "Error finding Customer" });
  }

  return res.status(400).json({ message: "Error with OTP Validation" });
};

export const RequestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      const { otp, expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOtp(otp, profile.phone);

      res.status(200).json({
        message: " OTP sent to your registered phone number",
      });
    }
  }
};

export const GetCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      return res.status(200).json(profile);
    }
  }

  return res.status(404).json({ message: "Error getting profile" });
};

export const UpdateCustomerProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const profileInputs = plainToClass(EditCustomerProfileInputs, req.body);

  const profileErrors = await validate(profileInputs, {
    validationError: { target: false },
  });

  const { firstName, lastName, address } = profileInputs;

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile) {
      profile.firstName = firstName;

      profile.lastName = lastName;

      profile.address = address;

      const result = await profile.save();

      return res.status(200).json(result);
    }
  }

  return res.status(404).json({ message: "Error updating profile" });
};

export const addToCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    let cartItems = Array();

    const { _id, unit } = <CartItems>req.body;

    const food = await Food.findById(_id);

    if (food) {
      if (profile !== null) {
        cartItems = profile.cart;

        if (cartItems.length > 0) {
          //check and update items
          let existingFoodItem = cartItems.filter(
            (item) => item.food._id.toString() === _id
          );

          if (existingFoodItem.length > 0) {
            const index = cartItems.indexOf(existingFoodItem[0]);
            if (unit > 0) {
              cartItems[index] = { food, unit };
            } else {
              cartItems.slice(index, 1);
            }
          } else {
            cartItems.push({ food, unit });
          }
        } else {
          cartItems.push({ food, unit });
        }

        if (cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();

          return res.status(200).json(cartResult.cart);
        }
      }
    }
  } else {
    return res.status(400).json({ message: "Error finding customer" });
  }
};

export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("cart.food");

    if (profile !== null) {
      return res.status(200).json(profile.cart);
    } else {
      return res
        .status(400)
        .json({ message: "Error fetching Cart Information" });
    }
  } else {
    return res.status(400).json({ message: "Error fetching customer" });
  }
};

export const deleteCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id);

    if (profile !== null) {
      profile.cart = [] as any;

      const cartResult = profile.save();

      return res.status(200).json(cartResult);
    }
  }

  return res.status(400).json({ message: "Cart is already empty" });
};
/** ----------------Create Payment ----------------------**/

export const CreatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const { amount, paymentMode, offerId } = req.body;

  let payableAmount = Number(amount);

  if (offerId) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.isActive) {
        payableAmount = payableAmount - appliedOffer.offerAmount;
      }
    }
  }

  // create link for payment Gateway

  // generate transaction
  const transaction = await Transaction.create({
    customer: customer._id,
    vendorId: "",
    orderId: "",
    orderValue: payableAmount,
    offerUsed: offerId || "NA",
    status: "OPEN",
    paymentMode: paymentMode,
    paymentResponse: "Payment is Cash on Delivery",
  });

  // return transaction id
  return res.status(200).json(transaction);
};

const validateTransaction = async (txnId: string) => {
  const currentTransaction = await Transaction.findById(txnId);

  if (currentTransaction) {
    if (currentTransaction.status.toLowerCase() !== "failed") {
      return { status: true, currentTransaction };
    }
  }

  return { status: false, currentTransaction };
};

/** ----------------------------Delivery Section ------------------------- */

const assignOrderToDelivery = async (orderId: string, vendorId: string) => {
  //find the vendor
  //find the nearest delivery person
  //assign delivery person and update the deliveryId
};

/** ----------------Order Section ----------------------**/
export const CreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //grab current logged in user

  const customer = req.user;

  const { txnId, amount, items } = <OrderInputs>req.body;

  // create an order ID

  if (customer) {
    const { status, currentTransaction } = await validateTransaction(txnId);

    if (!status) {
      return res
        .status(404)
        .json({ message: "Error Create Order : Issue with Transaction" });
    }

    const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    let cartItems = Array();

    let netAmount = 0.0;

    let vendorId = "";

    const foods = await Food.find()
      .where("_id")
      .in(items.map((item) => item._id))
      .exec();

    foods.map((food) => {
      items.map(({ _id, unit }) => {
        if (food._id == _id) {
          vendorId = food.vendorId;
          netAmount += food.price * unit;
          cartItems.push({ food, unit });
        }
      });
    });

    if (cartItems) {
      const currentOrder = await Order.create({
        orderID: orderId,
        vendorId: vendorId,
        items: cartItems,
        totalAmount: netAmount,
        paidAmount: amount,
        orderDate: new Date(),
        orderStatus: "Waiting",
        remarks: "",
        deliveryId: "",
        readyTime: 45,
      });

      currentTransaction.vendorId = vendorId;
      currentTransaction.orderId = orderId;
      currentTransaction.status = "CONFIRMED";

      if (currentOrder) {
        profile.cart = [] as any;
        profile.orders.push(currentOrder);
        await profile.save();
        await currentTransaction.save();
        return res.status(200).json(currentOrder);
      }
    }
    //Grab order items [{id : XX  , unit : XX}]

    //Calculate order amount

    //Create order with item description

    //Update order to the customer
    return res.status(400).json({ message: "Error Creating Order" });
  }

  return res.json(400).json({ message: "Error finding the customer" });
};

export const GetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id).populate("orders");

    if (profile) {
      return res.status(200).json(profile.orders);
    }
  }
};

export const GetOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const orderId = req.params.id;

  if (orderId) {
    const order = await Order.findById(orderId).populate("items.food");

    res.status(200).json(order);
  }
};

export const VerifyOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customer = req.user;

  const offerId = req.params.id;

  if (customer) {
    const appliedOffer = await Offer.findById(offerId);

    if (appliedOffer) {
      if (appliedOffer.isActive) {
        return res
          .status(200)
          .json({ message: "Offer is Valid", offer: appliedOffer });
      }
    }
  }

  return res.status(400).json({ message: "Invalid Offer" });
};
