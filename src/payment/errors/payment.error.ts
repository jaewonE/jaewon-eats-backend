//CoreOutput type
export const PaymentErrors = {
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
  paymentNotFound: {
    sucess: false,
    error: 'payment not found',
  },
};
