//CoreOutput type
export const RestaurantErrors = {
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
  restaurantNotFound: {
    sucess: false,
    error: 'Restaurant not found',
  },
  notOwner: {
    sucess: false,
    error: 'Access denied: not a owner of this restaurant.',
  },
};
