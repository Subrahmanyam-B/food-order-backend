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
exports.GetFoods = exports.AddFood = exports.UpdateVendorService = exports.UpdateVendorCoverImage = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VendorLogin = void 0;
const AdminController_1 = require("./AdminController");
const utilities_1 = require("../utilities");
const models_1 = require("../models");
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
            return res.json(signature);
        }
        else {
            return res.json({ message: "Password is invalid" });
        }
        return res.json({ message: "Login Succesfull" });
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
    if (user) {
        const existingVendor = yield (0, AdminController_1.findVendor)(user._id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
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
        const { name, description, category, readyTime, foodType, price, images } = req.body;
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
//# sourceMappingURL=VendorController.js.map