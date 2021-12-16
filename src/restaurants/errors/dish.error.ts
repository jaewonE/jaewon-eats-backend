//CoreOutput type
export const DishErrors = {
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
  dishNotFound: {
    sucess: false,
    error: 'dish not found',
  },
};
