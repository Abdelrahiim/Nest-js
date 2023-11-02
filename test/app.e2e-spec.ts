import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { faker } from '@faker-js/faker';

import { AuthDto } from '../src/auth/dto';
import * as process from 'process';
import { EditUserDto } from '../src/user/dto';

describe('App e2e ', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();

    await app.listen(process.env.PORT || 7000);
    await prisma.cleanDB();

    pactum.request.setBaseUrl('http://localhost:8000');
  });

  afterAll(async () => {
    await app.close();
    await prisma.disconnect();
  });

  describe('Authentication', () => {
    const user: AuthDto = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    describe('Signup', () => {
      it('Should Sign Up', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(user)
          .expectStatus(HttpStatus.CREATED);
      });
      it('Should Throw No body Provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('Should Throw No Password Provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: faker.internet.email() })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('Should Throw No Email Provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: faker.internet.password() })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Should Throw FORBIDDEN Error Credentials Taken', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(user)
          .expectStatus(HttpStatus.FORBIDDEN);
      });
    });

    describe('Sign In', () => {
      it('Should Throw No body Provided', async () => {
        return pactum
          .spec()
          .post('/auth/login')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('Should Throw No Password Provided', async () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: user.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('Should Throw No Email Provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: user.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('Should Return InValid Credentials', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: user.email, password: faker.internet.password() })
          .expectStatus(HttpStatus.FORBIDDEN);
      });
      it('Should Sign In', async () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(user)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('Users', () => {
    describe('Get Current User', () => {
      it('It Should Return Current User', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
      it('It Should Return Current User', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('Get All Users', () => {
      it('It Should Return All Users', async () => {
        return pactum
          .spec()
          .get('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
      it('It Should Throw UnAuthorized', async () => {
        return pactum
          .spec()
          .get('/users/')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('Edit User', () => {
      const update: EditUserDto = {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };
      it('It Should return New Update User', async () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(update)
          .expectBodyContains('firstName')
          .expectStatus(HttpStatus.OK);
      });
      it('It Should Throw UnAuthorized', async () => {
        return pactum
          .spec()
          .patch('/users/')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('BookMarks', () => {
    describe('Create bookmark', () => {
      it('Should Create New BookMark and Return ', () => {
        return pactum
          .spec()
          .post('/bookmarks/')
          .withBody({
            title: faker.commerce.productName(),
            link: faker.internet.url(),
            description: faker.commerce.productDescription(),
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .stores('bookmarkId', 'id')
          .expectHeaderContains('content-type', 'application/json')
          .expectStatus(HttpStatus.CREATED);
      });
      it('Should Return Missing Link ', () => {
        return pactum
          .spec()
          .post('/bookmarks/')
          .withBody({
            title: faker.commerce.productName(),
          })
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectHeaderContains('content-type', 'application/json')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('Should Throw UnAuthorized ', () => {
        return pactum
          .spec()
          .post('/bookmarks/')
          .withBody({
            title: faker.commerce.productName(),
            link: faker.internet.url(),
            description: faker.commerce.productDescription(),
          })
          .expectHeaderContains('content-type', 'application/json')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('GET bookmarks', () => {
      it('Should get All User bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK);
      });
      it('It Should Throw UnAuthorized', () => {
        return pactum
          .spec()
          .get('/bookmarks/')
          .expectHeaderContains('content-type', 'application/json')
          .expectStatus(HttpStatus.UNAUTHORIZED);
      });
    });
    describe('GET bookmark by Id', () => {
      it('It Should Return BookMark With Id ', () => {
        return pactum
          .spec()
          .get('/bookmarks/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.OK)
          .expectHeaderContains('content-type', 'application/json');
      });
      it('It Should Return Not Found', () => {
        return pactum
          .spec()
          .get('/bookmarks/3422324')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(HttpStatus.NOT_FOUND);
      });
    });
    describe('Edit bookmark', () => {});
    describe('delete bookmark', () => {});
  });
});
