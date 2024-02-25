import mongoose, { Schema } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string; //VENDOR //GENERIC
  title: string; // 20% OFF on Wednesday
  vendors: [any]; //['87afs6g98a']
  description: string;
  minValue: number; //min order value
  offerAmount: number; //200
  startValidity: Date;
  endValidity: Date;
  promocode: string; //WED20
  promoType: string; // USER //All //BANK //CARD
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema(
  {
    offerType: { type: String, required: true },
    title: { type: String, required: true },
    vendors: [
      {
        type: Schema.Types.ObjectId,
        ref: "vendor",
      },
    ],
    description: { type: String, required: true },
    minValue: { type: Number, required: true },
    offerAmount: { type: Number, required: true },
    startValidity: { type: Date },
    endValidity: { type: Date },
    promocode: { type: String, required: true },
    promoType: { type: String, required: true },
    bank: [
      {
        type: String,
      },
    ],
    bins: [
      {
        type: String,
      },
    ],
    pincode: { type: String },
    isActive: { type: Boolean },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

const Offer = mongoose.model<OfferDoc>("offer", OfferSchema);

export { Offer };
