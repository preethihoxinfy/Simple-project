import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseInput } from './dto/create-expense.input';
import { createObjectCsvStringifier, createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

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
        user: { connect: { id: userId } },
      },
    });
  }

  findAll() {
    return this.prisma.expense.findMany();
  }

  findByCategory(category: string) {
    return this.prisma.expense.findMany({ where: { category } });
  }

  getTotal() {
    return this.prisma.expense
      .aggregate({ _sum: { amount: true } })
      .then((result) => result._sum.amount ?? 0);
  }

  async exportExpenses(userId: number): Promise<string> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        amount: true,
        category: true,
        date: true,
      },
    });

    const formattedExpenses = expenses.map((exp) => ({
      ...exp,
      date: exp.date.toISOString().split('T')[0],
    }));

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'date', title: 'Date' },
      ],
    });

    const header = csvStringifier.getHeaderString();
    const records = csvStringifier.stringifyRecords(formattedExpenses);

    return header + records;
  }

  async generateCsv(userId: number): Promise<string> {
    const expenses = await this.prisma.expense.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        amount: true,
        category: true,
        date: true,
      },
    });

    const formattedExpenses = expenses.map((exp) => ({
      ...exp,
      date: exp.date.toISOString().split('T')[0],
    }));

    const exportsPath = join(__dirname, '../../exports');
    if (!fs.existsSync(exportsPath)) fs.mkdirSync(exportsPath);

    const fileName = `expenses_${uuidv4()}.csv`;
    const filePath = join(exportsPath, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'id', title: 'ID' },
        { id: 'title', title: 'Title' },
        { id: 'amount', title: 'Amount' },
        { id: 'category', title: 'Category' },
        { id: 'date', title: 'Date' },
      ],
    });

    await csvWriter.writeRecords(formattedExpenses);

    return `http://localhost:3002/exports/${fileName}`;
  }

  async exportChartData(userId: number): Promise<string> {
    // 1️ Aggregate total amount per category
    const categories = await this.prisma.expense.groupBy({
      by: ['category'],
      where: { userId },
      _sum: { amount: true },
    });

    // 2️Prepare CSV data
    const csvData = categories.map((c) => ({
      category: c.category,
      totalAmount: c._sum.amount ?? 0,
    }));

    const exportsPath = join(__dirname, '../../exports');
    if (!fs.existsSync(exportsPath)) fs.mkdirSync(exportsPath);

    const fileName = `chart_data_${uuidv4()}.csv`;
    const filePath = join(exportsPath, fileName);

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'category', title: 'Category' },
        { id: 'totalAmount', title: 'Total Amount' },
      ],
    });

    await csvWriter.writeRecords(csvData);

    return `http://localhost:3002/exports/${fileName}`;
  }
}
