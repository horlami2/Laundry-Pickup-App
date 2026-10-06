export const initializePaystackTransaction = async ({
  email,
  amount,
  reference,
  callbackUrl,
}) => {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: callbackUrl,
        currency: "NGN",
      }),
    },
  );

  const data = await response.json();

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Paystack initialization failed");
  }

  return data.data;
};
