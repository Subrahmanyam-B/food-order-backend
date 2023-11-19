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
  const authToken = "b5aa4d2bf9458fbcb7c92ae521244ec8";

  const client = require("twilio")(accountSid, authToken);

  const response = await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: "+18583465611",
    to: `+91${toPhoneNumber}`,
  });

  return response;
};

//Payment notifications
