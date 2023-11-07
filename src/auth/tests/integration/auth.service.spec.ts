import { AuthModule } from '../../auth.module';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from '../../dto';
import { faker } from '@faker-js/faker';
import { Tokens } from '../../types';
import { HttpStatus } from '@nestjs/common';

describe('Auth Flow', () => {
  let authModule: TestingModule;
  let prisma: PrismaService;
  let authService: AuthService;
  beforeAll(async () => {
    authModule = await Test.createTestingModule({
      providers: [AuthService, PrismaService, ConfigService, JwtService],
    }).compile();
    prisma = authModule.get<PrismaService>(PrismaService);
    authService = authModule.get<AuthService>(AuthService);
  });
  afterAll(async ()=>{
    await prisma.cleanDB()
    await prisma.disconnect()
  })
  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
  const user:AuthDto = {
    email: faker.internet.email(),
    password: faker.internet.password()
  }
  describe("Obtain token",()=>{
    it("Should Return Tokens",async ()=>{
      const tokens:Tokens = await authService.obtainToken(12,user.email)
      expect(tokens.refresh_token).toBeTruthy()
      expect(tokens.access_token).toBeTruthy()
    })
  })
  describe("Verify Password",()=>{
    let hashed:string
    it("Should Return True",async ()=>{
      hashed = await authService.hashData(user.password)
      expect(await authService.verifyHashed(hashed,user.password,"Invalid Credential")).toBe(true)
    })
    it("Should Return Forbidden",async ()=>{
      try{
        await authService.verifyHashed(hashed,faker.internet.password(),"Invalid Credential")
      } catch (e){
      expect(e.status).toBe(HttpStatus.FORBIDDEN)
      }
    })
  })
  describe("Sign up",()=>{
    it("Should Return Access Token and Refresh Token",async ()=>{
      const tokens:Tokens = await authService.signup(user)
      expect(tokens.refresh_token).toBeTruthy()
      expect(tokens.access_token).toBeTruthy()
    })
    it("it Should Return Duplicated  Credentials",async ()=>{
      let tokens:Tokens|undefined
      try {
        tokens = await authService.signup(user)
      } catch (e){
        expect(e.status).toBe(HttpStatus.FORBIDDEN)
      }
      expect(tokens).toBeUndefined()
    })
  })
  describe("Sign In",()=> {
    it("Should Return Access Token and Refresh Token",async ()=>{
      const tokens = await authService.login(user)
      expect(tokens.refresh_token).toBeTruthy()
      expect(tokens.access_token).toBeTruthy()
    })
    it("Should Return Password inCorrect",async ()=>{
      let tokens:Tokens
      try{
        tokens = await authService.login({
          email:user.email,
          password:faker.internet.password()
        })
        expect(tokens).toBeUndefined();

      } catch (e){
        expect(e.status).toBe(HttpStatus.FORBIDDEN)
      }
      expect(tokens).toBeUndefined()
    })

  })


});
