import mongoose, { Schema, Document } from "mongoose";

interface DeliveryDoc extends Document {
  email: string;
  password: string;
  salt: string;
  firstName: string;
  lastName: string;
  address: string;
  pincode: string;
  phone: string;
  verified: boolean;
  lat: number;
  lng: number;
  isAvailable: boolean;
}

const DeliveryUserSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    address: { type: String },
    pincode: { type: String },
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true },
    lat: { type: Number },
    lng: { type: Number },
    isAvailable: { type: Boolean },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.salt;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
    timestamps: true,
  }
);

const Delivery = mongoose.model<DeliveryDoc>(
  "delivery_user",
  DeliveryUserSchema
);

export { Delivery };
