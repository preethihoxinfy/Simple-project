import { registerEnumType } from '@nestjs/graphql';

export enum Category {
  FOOD = 'FOOD',
  TRANSPORT = 'TRANSPORT',
  SHIPPING = 'SHIPPING',
  BILLS = 'BILLS',
  TRAVEL = 'TRAVEL',
  PARTY = 'PARTY',
  OTHERS = 'OTHERS',
}

registerEnumType(Category, { name: 'Category' });
