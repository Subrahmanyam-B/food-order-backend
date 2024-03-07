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
exports.GetTransactions = exports.EditOffer = exports.CreateOffer = exports.GetOffers = exports.GetOrderDetails = exports.ProcessOrder = exports.GetCurrentOrders = exports.GetFoods = exports.AddFood = exports.UpdateVendorService = exports.UpdateVendorCoverImage = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VendorLogin = void 0;
const AdminController_1 = require("./AdminController");
const utilities_1 = require("../utilities");
const models_1 = require("../models");
const Order_1 = require("../models/Order");
const Offer_1 = require("../models/Offer");
const VendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVendor = yield (0, AdminController_1.findVendor)("", email);
    if (existingVendor !== null) {
        //validations and give access
        const validation = yield (0, utilities_1.ValidatePassword)(password, existingVendor.password, existingVendor.salt);
        if (validation) {
            const signature = (0, utilities_1.GenerateSignature)({
                _id: existingVendor._id,
                email: existingVendor.email,
                name: existingVendor.name,
                foodType: existingVendor.foodType,
            });
            return res.json({ token: signature });
        }
        else {
            return res.json({ message: "Password is invalid" });
        }
    }
    return res.json({ message: "Invalid login credentials" });
});
exports.VendorLogin = VendorLogin;
const GetVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user._id);
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor Information not found" });
});
exports.GetVendorProfile = GetVendorProfile;
const UpdateVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, foodType, phone, address } = req.body;
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user._id);
        if (existingVendor !== null) {
            existingVendor.name = name;
            existingVendor.foodType = foodType;
            existingVendor.phone = phone;
            existingVendor.address = address;
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor Information not found" });
});
exports.UpdateVendorProfile = UpdateVendorProfile;
const UpdateVendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vendor = yield (0, AdminController_1.findVendor)(user._id);
        if (vendor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vendor.coverImages.push(...images);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Something went wrong with add food" });
});
exports.UpdateVendorCoverImage = UpdateVendorCoverImage;
const UpdateVendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { lat, lng } = req.body;
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user._id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            if (lat && lng) {
                existingVendor.lat = lat;
                existingVendor.lng = lng;
            }
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor Information not found" });
});
exports.UpdateVendorService = UpdateVendorService;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { name, description, category, readyTime, foodType, price } = req.body;
        const vendor = yield (0, AdminController_1.findVendor)(user._id);
        if (vendor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            const createdFood = yield models_1.Food.create({
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
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Something went wrong with add food" });
});
exports.AddFood = AddFood;
const GetFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const foods = yield models_1.Food.find({
            vendorId: user._id,
        });
        if (foods !== null) {
            return res.json(foods);
        }
    }
    return res.json({ message: "Foods Information not found" });
});
exports.GetFoods = GetFoods;
const GetCurrentOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const orders = yield Order_1.Order.find({ vendorId: user._id }).populate("items.food");
        if (orders !== null) {
            return res.status(200).json(orders);
        }
    }
    return res.status(400).json({ message: "Order not found" });
});
exports.GetCurrentOrders = GetCurrentOrders;
const ProcessOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderID = req.params.id;
    const { status, remarks, time } = req.body;
    if (orderID) {
        const order = yield Order_1.Order.findById(orderID).populate("items.food");
        if (order !== null) {
            order.orderStatus = status;
            order.remarks = remarks;
            if (time) {
                order.readyTime = time;
            }
            const orderResult = yield order.save();
            if (orderResult !== null) {
                return res.status(200).json(orderResult);
            }
        }
    }
    return res.status(400).json({ message: "Unable to process order" });
});
exports.ProcessOrder = ProcessOrder;
const GetOrderDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orderID = req.params.id;
    if (orderID) {
        const order = yield Order_1.Order.find({ orderID: orderID }).populate("items.food");
        if (order !== null) {
            return res.status(200).json(order);
        }
    }
});
exports.GetOrderDetails = GetOrderDetails;
const GetOffers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const offers = yield Offer_1.Offer.find({}).populate("vendors");
        if (offers !== null) {
            let myOffers = Array();
            offers.map((offer) => {
                if (offer.vendors) {
                    offer.vendors.map((vendor) => {
                        if (vendor._id.toString() === user._id.toString()) {
                            myOffers.push(offer);
                        }
                    });
                }
                if (offer.offerType === "GENERIC") {
                    myOffers.push(offer);
                }
            });
            return res.status(200).json(myOffers);
        }
    }
    return res.status(400).json({ message: "Offers not found" });
});
exports.GetOffers = GetOffers;
const CreateOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { title, offerType, offerAmount, description, minValue, startValidity, endValidity, promoType, promocode, bins, bank, pincode, isActive, } = req.body;
        const vendor = yield (0, AdminController_1.findVendor)(user._id);
        if (vendor) {
            const offer = yield Offer_1.Offer.create({
                title,
                offerType,
                offerAmount,
                description,
                minValue,
                startValidity,
                endValidity,
                promoType,
                promocode,
                bins,
                bank,
                pincode,
                isActive,
                vendors: [vendor],
            });
            return res.status(200).json(offer);
        }
    }
    return res.status(400).json({ message: "Unable to create offer" });
});
exports.CreateOffer = CreateOffer;
const EditOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const offerId = req.params.id;
    const { title, offerType, offerAmount, description, minValue, startValidity, endValidity, promoType, promocode, bins, bank, pincode, isActive, } = req.body;
    if (user) {
        const existingOffer = yield Offer_1.Offer.findById(offerId);
        const vendor = yield (0, AdminController_1.findVendor)(user._id);
        if (existingOffer) {
            if (vendor) {
                existingOffer.title = title;
                existingOffer.offerType = offerType;
                existingOffer.offerAmount = offerAmount;
                existingOffer.description = description;
                existingOffer.minValue = minValue;
                existingOffer.startValidity = startValidity;
                existingOffer.endValidity = endValidity;
                existingOffer.promoType = promoType;
                existingOffer.promocode = promocode;
                existingOffer.bins = bins;
                existingOffer.bank = bank;
                existingOffer.pincode = pincode;
                existingOffer.isActive = isActive;
                const result = existingOffer.save();
                return res.status(200).json(existingOffer);
            }
        }
    }
    return res.status(400).json({ message: "Unable to edit offer" });
});
exports.EditOffer = EditOffer;
const GetTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = req.user;
    if (vendor) {
        const transactions = yield models_1.Transaction.find({ vendorId: vendor._id });
        if (transactions !== null) {
            return res.status(200).json(transactions);
        }
    }
    return res.status(400).json({ messages: "Error fetching Transactions" });
});
exports.GetTransactions = GetTransactions;
//# sourceMappingURL=VendorController.js.map