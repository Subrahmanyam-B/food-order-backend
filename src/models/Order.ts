import mongoose, { Schema, Document } from "mongoose";

export interface OrderDoc extends Document {
  orderID: string; //128379
  vendorId: string;
  items: [any]; // [{food : 1 , unit : 1}]
  totalAmount: number; // 329
  paidAmount: number; // 329
  orderDate: Date;
  orderStatus: string;
  remarks: string;
  deliveryId: string;
  readyTime: number;
}

const OrderSchema = new Schema(
  {
    orderID: { type: String, required: true }, //128379
    vendorId: { type: String, required: true },
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ], // [{food : 1 , unit : 1}]
    totalAmount: { type: Number, required: true }, // 329
    paidAmount: { type: Number, required: true }, // 329
    orderDate: { type: Date },
    orderStatus: { type: String },
    remarks: { type: String },
    deliveryId: { type: String },
    readyTime: { type: Number },
  },
  {
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

const Order = mongoose.model<OrderDoc>("order", OrderSchema);

export { Order };
