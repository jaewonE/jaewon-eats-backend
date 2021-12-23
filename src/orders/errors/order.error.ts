//CoreOutput type
export const OrderErrors = {
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
  orderNotFound: {
    sucess: false,
    error: 'order not found',
  },
  canNotAccessOrder: {
    sucess: false,
    error: 'Access denied: not a right owner of this order.',
  },
  dontHavePermission: {
    sucess: false,
    error: 'Permission denied: do not have permission to edit the order.',
  },
  takenOrder: {
    sucess: false,
    error: 'this order already has been taken.',
  },
};
