
 //<-----what API returns(models)------->
 //@ObjectType() + @Field()


import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Category } from '../enums/category.enum';

@ObjectType() // marks this class as GraphQL type
export class Expense {
  @Field(() => Int) // GraphQL field type
  id: number; // TypeScript type

  @Field()
  title: string;
 
  @Field(() => Float)
  amount: number;

  @Field(() => Category)
  category: Category;

  @Field()
  date: string;
}
