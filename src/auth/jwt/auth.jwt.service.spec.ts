import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtService } from './auth.jwt.service';
import * as jwt from 'jsonwebtoken';

const USER_ID = '1';
const JWT_PRIVATE_TOKEN = 'private_key';
const JWT_SIGN_TOKEN = 'SIGN_TOKEN';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => JWT_SIGN_TOKEN),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

const mockConfigService = {
  get: jest.fn(() => JWT_PRIVATE_TOKEN),
};

describe('JwtService', () => {
  let service: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });
  it('Should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('Should return a signed token', () => {
      const token = service.sign(USER_ID);
      expect(typeof token).toEqual('string');
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id: USER_ID }, JWT_PRIVATE_TOKEN);

      expect(configService.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('verify', () => {
    it('Should return the decoded token', () => {
      const decodedToken = service.verify(JWT_SIGN_TOKEN);
      expect(decodedToken).toEqual({ id: USER_ID });
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(
        JWT_SIGN_TOKEN,
        JWT_PRIVATE_TOKEN,
      );
    });
  });
});
