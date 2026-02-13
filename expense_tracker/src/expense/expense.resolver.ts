import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { ExpenseService } from './expense.service';
import { Expense } from './models/expense.model';
import { CreateExpenseInput } from './dto/create-expense.input';
import { Category } from './enums/category.enum';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => Expense)
export class ExpenseResolver {
  constructor(private expenseService: ExpenseService) {}

  @Mutation(() => Expense)
  @UseGuards(GqlAuthGuard)
  addExpense(
    @Args('createExpenseInput') input: CreateExpenseInput,
    @Context() ctx: any,
  ) {
    const userId = ctx.req.user.id;
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

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async exportExpenses(@Context() ctx: any): Promise<string> {
    const userId = ctx.req.user.id;
    return this.expenseService.exportExpenses(userId);
  }
  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async generateCsv(@Context() ctx: any): Promise<string> {
    const userId = ctx.req.user.id;
    return this.expenseService.generateCsv(userId);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  async exportChartData(@Context() ctx: any): Promise<string> {
    const userId = ctx.req.user.id;
    return this.expenseService.exportChartData(userId);
  }
}
