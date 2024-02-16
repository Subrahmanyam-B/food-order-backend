import mongoose, { Schema, Document } from "mongoose";

export interface OrderDoc extends Document {
  orderID: string; //128379
  items: [any]; // [{food : 1 , unit : 1}]
  totalAmount: number; // 329
  orderDate: Date;
  paidThrough: string;
  paymentResponse: string; // {status : true , response : some bank response}
  orderStatus: string;
}

const OrderSchema = new Schema(
  {
    orderID: { type: String, required: true }, //128379
    items: [
      {
        food: { type: Schema.Types.ObjectId, ref: "food", required: true },
        unit: { type: Number, required: true },
      },
    ], // [{food : 1 , unit : 1}]
    totalAmount: { type: Number, required: true }, // 329
    orderDate: { type: Date },
    paidThrough: { type: String },
    paymentResponse: { type: String }, // {status : true , response : some bank response}
    orderStatus: { type: String },
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
