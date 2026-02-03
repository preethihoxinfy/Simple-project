

//<----- what client can send  --->
//inputType() + @Field()

import { InputType, Field, Float } from '@nestjs/graphql';
import { Category } from '../enums/category.enum';

@InputType()
export class CreateExpenseInput {
  @Field()
  title: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Category)
  category: Category;

  @Field()
  date: string;
}
