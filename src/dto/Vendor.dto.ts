export interface CreateVendorInput {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  address: string;
  phone: string;
  email: string;
  password: string;
}

export interface EditVendorInputs {
  name: string;
  address: string;
  phone: string;
  foodType: [string];
}

export interface VendorLoginInput {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  email: string;
  name: string;
  foodType: [string];
}

export interface CreateOfferInput {
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
