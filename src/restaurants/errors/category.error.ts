//CoreOutput type
export const CategoryErrors = {
  categoryNotFound: {
    sucess: false,
    error: 'Category Not Found',
  },
  categoryalreadyExist: {
    sucess: false,
    error: 'Category is already exist.',
  },
  noSelector: {
    sucess: false,
    error: 'slug or id does not exist in input selector.',
  },
  categoryNotFoundWithName: (name: string) => {
    return { sucess: false, error: `No category name with ${name}.` };
  },
  unexpectedError: (from: string) => {
    return { sucess: false, error: `Unexpected error from ${from}` };
  },
};
