//CoreOutput type
export const userErrors = {
  notFound: {
    sucess: false,
    error: 'User not found',
  },
  wrongPassword: {
    sucess: false,
    error: 'Wrong password',
  },
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
  userExists: (email: string) => {
    return {
      sucess: false,
      error: `An account with Email ${email} already exists.`,
    };
  },
};
