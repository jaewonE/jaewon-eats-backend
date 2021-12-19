//CoreOutput type
export const OrderErrors = {
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
};
