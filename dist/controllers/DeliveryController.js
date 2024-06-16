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
exports.UpdateDeliveryStatus = exports.UpdateDeliveryProfile = exports.GetDeliveryProfile = exports.DeliveryLogin = exports.DeliverySignUp = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../dto");
const utilities_1 = require("../utilities");
const models_1 = require("../models");
const DeliverySignUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const deliveryInputs = (0, class_transformer_1.plainToClass)(dto_1.CreateDeliveryUserInputs, req.body);
    const inputErrors = yield (0, class_validator_1.validate)(deliveryInputs, {
        validationError: { target: true },
    });
    if (inputErrors.length > 0) {
        return res.status(400).json(inputErrors);
    }
    const { email, phone, password, firstName, lastName, address, pincode } = deliveryInputs;
    const salt = yield (0, utilities_1.GenerateSalt)();
    const userpassword = yield (0, utilities_1.GeneratePassword)(password, salt);
    const existingDelivery = yield models_1.Delivery.findOne({ email: email });
    if (existingDelivery !== null) {
        return res
            .status(409)
            .json({ message: "An delivery user exist with the following email ID" });
    }
    const result = yield models_1.Delivery.create({
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
exports.DeliverySignUp = DeliverySignUp;
const DeliveryLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
    const deliveryUser = yield models_1.Delivery.findOne({ email: loginInputs.email });
    if (deliveryUser) {
        const validation = yield (0, utilities_1.ValidatePassword)(password, deliveryUser.password, deliveryUser.salt);
        if (validation) {
            const signature = (0, utilities_1.GenerateSignature)({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified,
            });
            //send the result to the client
            return res.status(201).json({
                signature: signature,
                email: deliveryUser.email,
                verified: deliveryUser.verified,
            });
        }
        else {
            return res.status(400).json({ message: "Error with password " });
            // password does not match
        }
    }
    return res.status(404).json({ message: "Error with Login" });
});
exports.DeliveryLogin = DeliveryLogin;
const GetDeliveryProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const profile = yield models_1.Delivery.findById(user._id);
        if (profile) {
            return res.status(200).json(profile);
        }
    }
    return res.status(404).json({ message: "Error getting profile" });
});
exports.GetDeliveryProfile = GetDeliveryProfile;
const UpdateDeliveryProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const profileInputs = (0, class_transformer_1.plainToClass)(dto_1.EditCustomerProfileInputs, req.body);
    const profileErrors = yield (0, class_validator_1.validate)(profileInputs, {
        validationError: { target: false },
    });
    const { firstName, lastName, address, pincode } = profileInputs;
    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors);
    }
    if (user) {
        const profile = yield models_1.Delivery.findById(user._id);
        if (profile) {
            profile.firstName = firstName;
            profile.lastName = lastName;
            profile.address = address;
            profile.pincode = pincode;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
    return res.status(404).json({ message: "Error updating profile" });
});
exports.UpdateDeliveryProfile = UpdateDeliveryProfile;
const UpdateDeliveryStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { lat, lng } = req.body;
        const profile = yield models_1.Delivery.findById(user._id);
        if (profile) {
            if (lat && lng) {
                profile.lat = lat;
                profile.lng = lng;
            }
            profile.isAvailable = !profile.isAvailable;
            const result = yield profile.save();
            return res.status(200).json(result);
        }
    }
    return res.status(404).json({ message: "Error updating profile" });
});
exports.UpdateDeliveryStatus = UpdateDeliveryStatus;
//# sourceMappingURL=DeliveryController.js.map