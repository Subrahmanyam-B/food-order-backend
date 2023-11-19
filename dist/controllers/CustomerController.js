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
exports.UpdateCustomerProfile = exports.GetCustomerProfile = exports.RequestOtp = exports.VerifyCustomer = exports.CustomerLogin = exports.CustomerSignUp = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const dto_1 = require("../dto");
const utilities_1 = require("../utilities");
const models_1 = require("../models");
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
    const loginErrors = yield (0, class_validator_1.validate)(loginInputs, {
        validationError: { target: false },
    });
    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }
    const { email, password } = loginInputs;
    const customer = yield models_1.Customer.findOne({ email: email });
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
            // return res.status(400)
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
//# sourceMappingURL=CustomerController.js.map