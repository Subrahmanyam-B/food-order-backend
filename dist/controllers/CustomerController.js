"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOffer = exports.GetOrderById = exports.GetOrders = exports.CreateOrder = exports.CreatePayment = exports.deleteCart = exports.getCart = exports.addToCart = exports.UpdateCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.VerifyCustomer = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../dto");
const utilities_1 = require("../utilities");
const models_1 = require("../models");
const Order_1 = require("../models/Order");
const Offer_1 = require("../models/Offer");
const CustomerSignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customerInputs = (0, class_transformer_1.plainToClass)(dto_1.CreateCustomerInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(customerInputs, {
        validationError: { target: true },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password } = customerInputs;
    const salt = yield (0, utilities_1.GenerateSalt)();
    const userpassword = yield (0, utilities_1.GeneratePassword)(password, salt);
    const { otp, expiry } = (0, utilities_1.GenerateOtp)();
    const existCustomer = yield models_1.Customer.findOne({ email: email });
    if (existCustomer !== null) {
        return res
            .status(409)
            .json({ message: "An user exist with the following email ID" });
    }
    const result = yield models_1.Customer.create({
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
        yield (0, utilities_1.onRequestOtp)(otp, phone);
        //generate signature
        const signature = (0, utilities_1.GenerateSignature)({
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
});
exports.CustomerSignUp = CustomerSignUp;
const CustomerLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const loginInputs = (0, class_transformer_1.plainToClass)(dto_1.UserLoginInputs, req.body);
    console.log(loginInputs);
    const loginErrors = yield (0, class_validator_1.validate)(loginInputs, {
        validationError: { target: false },
    });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { email, password } = loginInputs;
    console.log(email);
    const customer = yield models_1.Customer.findOne({ email: loginInputs.email });
    if (customer) {
        const validation = yield (0, utilities_1.ValidatePassword)(password, customer.password, customer.salt);
        if (validation) {
            const signature = (0, utilities_1.GenerateSignature)({
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
        }
        else {
            return res.status(400).json({ message: "Error with password " });
            // password does not match
        }
    }
    return res.status(404).json({ message: "Error with Login" });
});
exports.CustomerLogin = CustomerLogin;
const VerifyCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile !== null) {
            console.log(parseInt(otp));
            console.log(profile.otp_expiry);
            console.log(new Date());
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                console.log(profile);
                profile.verified = true;
                const updatedCustomerProfile = yield profile.save();
                const signature = (0, utilities_1.GenerateSignature)({
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
});
exports.VerifyCustomer = VerifyCustomer;
const RequestOtp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            const { otp, expiry } = (0, utilities_1.GenerateOtp)();
            profile.otp = otp;
            profile.otp_expiry = expiry;
            yield profile.save();
            yield (0, utilities_1.onRequestOtp)(otp, profile.phone);
            res.status(200).json({
                message: " OTP sent to your registered phone number",
            });
        }
    }
});
exports.RequestOtp = RequestOtp;
const GetCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    return res.status(404).json({ message: "Error getting profile" });
});
exports.GetCustomerProfile = GetCustomerProfile;
const UpdateCustomerProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(dto_1.EditCustomerProfileInputs, req.body);
    const profileErrors = yield (0, class_validator_1.validate)(profileInputs, {
        validationError: { target: false },
    });
    const { firstName, lastName, address } = profileInputs;
    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors);
    }
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
    return res.status(404).json({ message: "Error updating profile" });
});
exports.UpdateCustomerProfile = UpdateCustomerProfile;
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id).populate("cart.food");
        let cartItems = Array();
        const { _id, unit } = req.body;
        const food = yield models_1.Food.findById(_id);
        if (food) {
            if (profile !== null) {
                cartItems = profile.cart;
                if (cartItems.length > 0) {
                    //check and update items
                    let existingFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);
                    if (existingFoodItem.length > 0) {
                        const index = cartItems.indexOf(existingFoodItem[0]);
                        if (unit > 0) {
                            cartItems[index] = { food, unit };
                        }
                        else {
                            cartItems.slice(index, 1);
                        }
                    }
                    else {
                        cartItems.push({ food, unit });
                    }
                }
                else {
                    cartItems.push({ food, unit });
                }
                if (cartItems) {
                    profile.cart = cartItems;
                    const cartResult = yield profile.save();
                    return res.status(200).json(cartResult.cart);
                }
            }
        }
    }
    else {
        return res.status(400).json({ message: "Error finding customer" });
    }
});
exports.addToCart = addToCart;
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id).populate("cart.food");
        if (profile !== null) {
            return res.status(200).json(profile.cart);
        }
        else {
            return res
                .status(400)
                .json({ message: "Error fetching Cart Information" });
        }
    }
    else {
        return res.status(400).json({ message: "Error fetching customer" });
    }
});
exports.getCart = getCart;
const deleteCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id);
        if (profile !== null) {
            profile.cart = [];
            const cartResult = profile.save();
            return res.status(200).json(cartResult);
        }
    }
    return res.status(400).json({ message: "Cart is already empty" });
});
exports.deleteCart = deleteCart;
/** ----------------Create Payment ----------------------**/
const CreatePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const { amount, paymentMode, offerId } = req.body;
    let payableAmount = Number(amount);
    if (offerId) {
        const appliedOffer = yield Offer_1.Offer.findById(offerId);
        if (appliedOffer) {
            if (appliedOffer.isActive) {
                payableAmount = payableAmount - appliedOffer.offerAmount;
            }
        }
    }
    // create link for payment Gateway
    // generate transaction
    const transaction = yield models_1.Transaction.create({
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
});
exports.CreatePayment = CreatePayment;
const validateTransaction = (txnId) => __awaiter(void 0, void 0, void 0, function* () {
    const currentTransaction = yield models_1.Transaction.findById(txnId);
    if (currentTransaction) {
        if (currentTransaction.status.toLowerCase() !== "failed") {
            return { status: true, currentTransaction };
        }
    }
    return { status: false, currentTransaction };
});
/** ----------------------------Delivery Section ------------------------- */
const assignOrderToDelivery = (orderId, vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    //find the vendor
    const vendor = yield models_1.Vendor.findById(vendorId);
    if (vendor) {
        const areaCode = vendor.pincode;
        const vendorLat = vendor.lat;
        const vendorLng = vendor.lng;
        const deliveryPerson = yield models_1.Delivery.find({
            pincode: areaCode,
            verified: true,
            isAvailable: true,
        });
        //find the nearest delivery person
        if (deliveryPerson) {
            const currentOrder = yield Order_1.Order.findById(orderId);
            if (currentOrder) {
                currentOrder.deliveryId = deliveryPerson[0]._id;
                const respone = yield currentOrder.save();
                console.log("Delivery User Assigned");
            }
        }
        //assign delivery person and update the deliveryId
    }
});
/** ----------------Order Section ----------------------**/
const CreateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //grab current logged in user
    const customer = req.user;
    const { txnId, amount, items } = req.body;
    // create an order ID
    if (customer) {
        const { status, currentTransaction } = yield validateTransaction(txnId);
        if (!status) {
            return res
                .status(404)
                .json({ message: "Error Create Order : Issue with Transaction" });
        }
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;
        const profile = yield models_1.Customer.findById(customer._id);
        let cartItems = Array();
        let netAmount = 0.0;
        let vendorId = "";
        const foods = yield models_1.Food.find()
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
            const currentOrder = yield Order_1.Order.create({
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
                profile.cart = [];
                profile.orders.push(currentOrder);
                yield profile.save();
                yield currentTransaction.save();
                assignOrderToDelivery(currentOrder._id, vendorId);
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
});
exports.CreateOrder = CreateOrder;
const GetOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    if (customer) {
        const profile = yield models_1.Customer.findById(customer._id).populate("orders");
        if (profile) {
            return res.status(200).json(profile.orders);
        }
    }
});
exports.GetOrders = GetOrders;
const GetOrderById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.params.id;
    if (orderId) {
        const order = yield Order_1.Order.findById(orderId).populate("items.food");
        res.status(200).json(order);
    }
});
exports.GetOrderById = GetOrderById;
const VerifyOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const customer = req.user;
    const offerId = req.params.id;
    if (customer) {
        const appliedOffer = yield Offer_1.Offer.findById(offerId);
        if (appliedOffer) {
            if (appliedOffer.isActive) {
                return res
                    .status(200)
                    .json({ message: "Offer is Valid", offer: appliedOffer });
            }
        }
    }
    return res.status(400).json({ message: "Invalid Offer" });
});
exports.VerifyOffer = VerifyOffer;
//# sourceMappingURL=CustomerController.js.map