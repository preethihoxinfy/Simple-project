import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseResolver } from './expense.resolver';
import { ExpenseService } from './expense.service';
import { Category } from './enums/category.enum';

describe('ExpenseResolver', () => {
  let resolver: ExpenseResolver;
  let expenseService: any;

  const mockExpenseService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByCategory: jest.fn(),
    getTotal: jest.fn(),
    exportExpenses: jest.fn(),
    generateCsv: jest.fn(),
    exportChartData: jest.fn(),
  };

  const mockContext = {
    req: {
      user: {
        id: 1,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseResolver,
        {
          provide: ExpenseService,
          useValue: mockExpenseService,
        },
      ],
    }).compile();

    resolver = module.get<ExpenseResolver>(ExpenseResolver);
    expenseService = module.get(ExpenseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ addExpense
  it('should add expense', async () => {
    const input = {
      title: 'Food',
      amount: 200,
      category: Category.FOOD,
      date: '2025-02-13',
    };

    const result = { id: 1, ...input };

    expenseService.create.mockResolvedValue(result);

    const response = await resolver.addExpense(input as any, mockContext);

    expect(expenseService.create).toHaveBeenCalledWith(input, 1);
    expect(response).toEqual(result);
  });

  // ✅ expenses
  it('should return all expenses', async () => {
    const result = [{ id: 1, title: 'Food' }];

    expenseService.findAll.mockResolvedValue(result);

    const response = await resolver.expenses();

    expect(expenseService.findAll).toHaveBeenCalled();
    expect(response).toEqual(result);
  });

  // ✅ expensesByCategory
  it('should return expenses by category', async () => {
    const result = [{ id: 1, category: Category.FOOD }];

    expenseService.findByCategory.mockResolvedValue(result);

    const response = await resolver.expensesByCategory(Category.FOOD);

    expect(expenseService.findByCategory).toHaveBeenCalledWith(Category.FOOD);
    expect(response).toEqual(result);
  });

  // ✅ totalExpense
  it('should return total expense', async () => {
    expenseService.getTotal.mockResolvedValue(500);

    const response = await resolver.totalExpense();

    expect(expenseService.getTotal).toHaveBeenCalled();
    expect(response).toBe(500);
  });

  // ✅ exportExpenses
  it('should export expenses CSV string', async () => {
    expenseService.exportExpenses.mockResolvedValue('csv-data');

    const response = await resolver.exportExpenses(mockContext);

    expect(expenseService.exportExpenses).toHaveBeenCalledWith(1);
    expect(response).toBe('csv-data');
  });

  // ✅ generateCsv
  it('should generate CSV file URL', async () => {
    expenseService.generateCsv.mockResolvedValue(
      'http://localhost:3002/exports/test.csv',
    );

    const response = await resolver.generateCsv(mockContext);

    expect(expenseService.generateCsv).toHaveBeenCalledWith(1);
    expect(response).toBe('http://localhost:3002/exports/test.csv');
  });

  // ✅ exportChartData
  it('should export chart data CSV URL', async () => {
    expenseService.exportChartData.mockResolvedValue(
      'http://localhost:3002/exports/chart.csv',
    );

    const response = await resolver.exportChartData(mockContext);

    expect(expenseService.exportChartData).toHaveBeenCalledWith(1);
    expect(response).toBe('http://localhost:3002/exports/chart.csv');
  });
});
