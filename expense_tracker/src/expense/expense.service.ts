import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseInput } from './dto/create-expense.input';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  create(input: CreateExpenseInput, userId: number) {
    return this.prisma.expense.create({
      data: {
        title: input.title,
        amount: input.amount,
        category: input.category,
        date: new Date(input.date),

        // ✅ Connect to user
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  findAll() {
    return this.prisma.expense.findMany();
  }

  findByCategory(category: string) {
    return this.prisma.expense.findMany({
      where: { category },
    });
  }

  getTotal() {
    return this.prisma.expense
      .aggregate({
        _sum: { amount: true },
      })
      .then((result) => result._sum.amount ?? 0);
  }
}
