import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Expense App (E2E)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
let testEmail: string;
it('register user', async () => {
  testEmail = `test${Date.now()}@test.com`;

  const res = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: `
        mutation {
          register(
            input: {
              email: "${testEmail}"
              password: "Password123!"
            }
          )
        }
      `,
    });

  console.log('REGISTER RESPONSE:', res.body);

  expect(res.body.data.register).toBe(true);
});


it('login and get JWT', async () => {
  const res = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      query: `
        mutation {
          login(
            input: {
              email: "${testEmail}"
              password: "Password123!"

            }
          ) {
            accessToken
          }
        }
      `,
    })
    .expect(200);

  jwtToken = res.body.data.login.accessToken;
  expect(jwtToken).toBeDefined();
});

  // ✅ Add Expense (Guarded)
  it('add expense (authenticated)', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `
          mutation {
            addExpense(
              createExpenseInput: {
                title: "Food"
                amount: 100
                category: FOOD
                date: "2024-01-01"
              }
            ) {
              id
              title
              amount
            }
          }
        `,
      })
      .expect(200);

    expect(res.body.data.addExpense.title).toBe('Food');
  });

  // ✅ Get Expenses (not guarded in your resolver)
  it('get all expenses', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            expenses {
              id
              title
            }
          }
        `,
      })
      .expect(200);

    expect(res.body.data.expenses.length).toBeGreaterThan(0);
  });

  // ✅ Total Expense (not guarded)
  it('get total expense', async () => {
    const res = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            totalExpense
          }
        `,
      })
      .expect(200);

    expect(res.body.data.totalExpense).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
