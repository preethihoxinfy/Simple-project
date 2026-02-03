import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ExpenseService } from './expense.service';
import { Expense } from './models/expense.model';
import { CreateExpenseInput } from './dto/create-expense.input';
import { Category } from './enums/category.enum';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Expense)
@UseGuards(GqlAuthGuard) // applies to ALL resolvers below
export class ExpenseResolver {
  constructor(private expenseService: ExpenseService) {}

  // @Mutation(() => Expense)
  // addExpense(@Args('createExpenseInput') input: CreateExpenseInput) {
  //   return this.expenseService.create(input);
  // }
@Mutation(() => Expense)
addExpense(
  @Args('createExpenseInput') input: CreateExpenseInput, @Context() ctx: any,) 
{
  const userId = ctx.req.user.userId;//sub; // sub = user.id from JWT
  return this.expenseService.create(input, userId);
}

 
  @Query(() => [Expense])
  expenses() {
    return this.expenseService.findAll();
  }

  @Query(() => [Expense])
  expensesByCategory(
    @Args('category', { type: () => Category }) category: Category,
  ) {
    return this.expenseService.findByCategory(category);
  }

  @Query(() => Number)
  totalExpense() {
    return this.expenseService.getTotal();
  }
}
