import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { userErrors } from 'src/user/errors/user.error';

const GRAPHQL_ENDPOINT = '/graphql';
const userObj = {
  name: 'jaewone',
  age: 22,
  email: 'test@email.com',
  password: '12345',
};

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const userTest = (query: string) => baseTest().send({ query });
  const userJwtTest = (query: string) =>
    baseTest().set('X-JWT', jwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('createUser', () => {
    it('Should create user', () => {
      return userTest(`
          mutation {
            createUser(input: {
              name: "${userObj.name}"
              age: ${userObj.age},
              email: "${userObj.email}"
              password: "${userObj.password}"
              role: Delivery
              gender: Male
            }) {
              sucess
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser).toMatchObject({
            sucess: true,
            error: null,
          });
        });
    });
    it('Should fail if user with same email has already exists', () => {
      return userTest(`
          mutation {
            createUser(input: {
              name: "${userObj.name}"
              age: ${userObj.age},
              email: "${userObj.email}"
              password: "${userObj.password}"
              role: Delivery
              gender: Male
            }) {
              sucess
              error
            }
          }
        `)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.createUser).toMatchObject(
            userErrors.userExists(userObj.email),
          );
        });
    });
    it('Should fail if email field get a string that not a form of email(class-validateor - @IsEmail', () => {
      return userTest(`
        mutation {
          createUser(input: {
            name: "${userObj.name}"
            age: ${userObj.age},
            email: "not_a_email_form_string"
            password: "${userObj.password}"
            role: Delivery
            gender: Male
          }) {
            sucess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const resObj = res.body.errors[0].extensions;
          expect(resObj.code).toEqual('BAD_USER_INPUT');
          expect(resObj.response.message[0]).toEqual('email must be an email');
        });
    });
  });
  describe('findUser', () => {
    it('Should fail if selector does not have property of email or id', () => {
      return userTest(`
      query {
        findUser(input: {}) {
          sucess
          error
          user {
            id
            name
            email
          }
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.findUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual('Email or ID does not exist on the input.');
          expect(user).toEqual(null);
        });
    });
    it('Should return user', () => {
      return userTest(`
        query {
          findUser(input: {email: "${userObj.email}"}) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.findUser;
          expect(sucess).toEqual(true);
          expect(error).toEqual(null);
          expect(user.id).toEqual(1);
          expect(user.email).toEqual(userObj.email);
          expect(user.name).toEqual(userObj.name);
        });
    });
    it('Should fail if user not found', () => {
      return userTest(`
        query {
          findUser(input: {email: "notAUser@email.com"}) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.findUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual(userErrors.userNotFound.error);
          expect(user).toEqual(null);
        });
    });
    it('Should fail if request property "password" in user', () => {
      return userTest(`
        query {
          findUser(input: { email: "test@email.com" }) {
            sucess
            error
            user {
              id
              name
              email
              password
            }
          }
        }      
      `)
        .expect(200)
        .expect((res) => {
          const { errors, data } = res.body;
          expect(errors[0].message).toEqual(
            'Cannot return null for non-nullable field User.password.',
          );
          expect(data.findUser.user).toEqual(null);
        });
    });
  });

  describe('login', () => {
    it('Should login', () => {
      return userTest(`
      mutation {
        login(input: {
          email: "${userObj.email}",
          password: "${userObj.password}"
        }) {
          error
          sucess
          token
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const { error, sucess, token } = res.body.data.login;
          jwtToken = token;
          expect(error).toEqual(null);
          expect(sucess).toEqual(true);
          expect(token).toEqual(expect.any(String));
        });
    });
    it('Should fail if user not found', () => {
      return userTest(`
      mutation {
        login(input: {
          email: "email@notOn.db",
          password: "${userObj.password}"
        }) {
          error
          sucess
          token
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const { error, sucess, token } = res.body.data.login;
          expect(error).toEqual(userErrors.userNotFound.error);
          expect(sucess).toEqual(false);
          expect(token).toEqual(null);
        });
    });
    it('Should fail if password is incorrect.', () => {
      return userTest(`
      mutation {
        login(input: {
          email: "${userObj.email}",
          password: "notCorrectPassword"
        }) {
          error
          sucess
          token
        }
      }
      `)
        .expect(200)
        .expect((res) => {
          const { error, sucess, token } = res.body.data.login;
          expect(error).toEqual(userErrors.wrongPassword.error);
          expect(sucess).toEqual(false);
          expect(token).toEqual(null);
        });
    });
  });

  describe('getCurrentUser', () => {
    it('Should return user', () => {
      return userJwtTest(`
        query {
          getCurrentUser {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.getCurrentUser;
          expect(error).toEqual(null);
          expect(sucess).toEqual(sucess);
          expect(user.id).toEqual(1);
          expect(user.email).toEqual(userObj.email);
          expect(user.name).toEqual(userObj.name);
        });
    });
    it('Should fail if jwtToken was wrong or not exists', () => {
      return baseTest()
        .set('X-JWT', 'WrongJwtToken')
        .send({
          query: `
        query {
          getCurrentUser {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `,
        })
        .expect(200)
        .expect((res) => {
          const resExtensions = res.body.errors[0].extensions;
          expect(resExtensions.code).toEqual('FORBIDDEN');
          expect(resExtensions.response.statusCode).toEqual(403);
          expect(resExtensions.response.message).toEqual('Forbidden resource');
        });
    });
  });
  describe('updateUser', () => {
    it('Should fail if payload is empty.', () => {
      return userTest(`
        mutation {
          updateUser(input: { selector: { email: "${userObj.email}" }, payload: {} }) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }      
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.updateUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual(
            'The element to be updated does not exist in the payload.',
          );
          expect(user).toEqual(null);
        });
    });
    it('Should fail if selector does not have property of email or id', () => {
      return userTest(`
        mutation {
          updateUser(input: {
            selector: {}
            payload: {email: "changed@email.com"}
          }) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.updateUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual('Email or ID does not exist on the input.');
          expect(user).toEqual(null);
        });
    });
    it('Should fail if user not found', () => {
      return userTest(`
        mutation {
          updateUser(input: {
            selector: {email: "userNotFound@email.com"}
            payload: {email: "changed@email.com"}
          }) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.updateUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual(userErrors.userNotFound.error);
          expect(user).toEqual(null);
        });
    });
    it('Should update user object', () => {
      const changedEmail = 'changed@email.com';
      return userTest(`
        mutation {
          updateUser(input: {
            selector: {email: "${userObj.email}"}
            payload: {email: "${changedEmail}"}
          }) {
            sucess
            error
            user {
              id
              name
              email
            }
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error, user } = res.body.data.updateUser;
          if (sucess) {
            userObj.email = changedEmail;
          }
          expect(sucess).toEqual(true);
          expect(error).toEqual(null);
          expect(user).toMatchObject({
            id: 1,
            name: userObj.name,
            email: changedEmail,
          });
        });
    });
  });
  describe('deleteUser', () => {
    it('Should fail if selector does not have property of email or id', () => {
      return userTest(`
        mutation {
          deleteUser(input: {}) {
            sucess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error } = res.body.data.deleteUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual('Email or ID does not exist on the input.');
        });
    });
    it('Should fail if user not found', () => {
      return userTest(`
        mutation {
          deleteUser(input: {
            email: "userNotFound@email.com"
          }) {
            sucess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error } = res.body.data.deleteUser;
          expect(sucess).toEqual(false);
          expect(error).toEqual(userErrors.userNotFound.error);
        });
    });
    it('Should delete user', () => {
      return userTest(`
        mutation {
          deleteUser(input: {
            email: "${userObj.email}"
          }) {
            sucess
            error
          }
        }
      `)
        .expect(200)
        .expect((res) => {
          const { sucess, error } = res.body.data.deleteUser;
          expect(sucess).toEqual(true);
          expect(error).toEqual(null);
        });
    });
  });
});
