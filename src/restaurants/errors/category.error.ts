//CoreOutput type
export const CategoryErrors = {
  categoryNotFound: {
    sucess: false,
    error: 'Category Not Found',
  },
  categoryNotFoundWithName: (name: string) => {
    return { sucess: false, error: `No category name with ${name}.` };
  },
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
};
