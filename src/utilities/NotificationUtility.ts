// email

//notification

//OTP

export const GenerateOtp = () => {
  const otp = Math.floor(10000 + Math.random() * 900000);

  let expiry = new Date();

  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);

  return { otp, expiry };
};

export const onRequestOtp = async (otp: number, toPhoneNumber: string) => {
  const accountSid = "ACbe27bfc1d9c2272a4d21266018a81310";
  const authToken = "0d87a47b4bc5e5262ca0261e81cb3f28";

  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "18283574941",
    to: `+91${toPhoneNumber}`,
  });

  return response;
};

//Payment notifications
