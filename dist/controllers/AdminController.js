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
exports.GetVendorByID = exports.GetVendors = exports.CreateVendor = exports.findVendor = void 0;
const models_1 = require("../models");
const utilities_1 = require("../utilities");
const findVendor = (id, email) => __awaiter(void 0, void 0, void 0, function* () {
    if (email) {
        return yield models_1.Vendor.findOne({ email: email });
    }
    else {
        return yield models_1.Vendor.findById(id);
    }
});
exports.findVendor = findVendor;
const CreateVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address, phone, email, pincode, foodType, password, ownerName, } = req.body;
    const existingVendor = yield (0, exports.findVendor)("", email);
    if (existingVendor !== null) {
        return res.json({
            message: "A vendor with the same emailID already exist",
        });
    }
    //generate a salt
    const salt = yield (0, utilities_1.GenerateSalt)();
    const userpassword = yield (0, utilities_1.GeneratePassword)(password, salt);
    //encrypt with the salt
    const createdVendor = yield models_1.Vendor.create({
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
    });
    return res.json(createdVendor);
});
exports.CreateVendor = CreateVendor;
const GetVendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendors = yield models_1.Vendor.find();
    if (vendors !== null) {
        return res.json(vendors);
    }
    return res.json({ message: "Vendors Data not available" });
});
exports.GetVendors = GetVendors;
const GetVendorByID = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const vendorID = req.params.id;
    const vendor = yield (0, exports.findVendor)(vendorID);
    if (vendor !== null) {
        return res.json(vendor);
    }
    return res.json({ message: "Vendors Data not available" });
});
exports.GetVendorByID = GetVendorByID;
//# sourceMappingURL=AdminController.js.map