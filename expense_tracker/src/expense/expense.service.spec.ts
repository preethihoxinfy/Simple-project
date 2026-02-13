import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService } from './expense.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExpenseService', () => {
  let service: ExpenseService;
  let prisma: PrismaService;

  const mockPrisma = {
    expense: {
      create: jest.fn(),
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockUserId = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ CREATE
  it('should create an expense', async () => {
    const input = {
      title: 'Coffee',
      amount: 150,
      category: 'FOOD',
      date: '2026-02-13',
    };

    mockPrisma.expense.create.mockResolvedValue({
      id: 1,
      ...input,
    });

    const result = await service.create(input as any, mockUserId);

    expect(prisma.expense.create).toHaveBeenCalled();
    expect(result.title).toEqual('Coffee');
  });

  // ✅ FIND ALL
  it('should return all expenses', async () => {
    mockPrisma.expense.findMany.mockResolvedValue([{ id: 1 }]);

    const result = await service.findAll();

    expect(result).toEqual([{ id: 1 }]);
  });

  // ✅ FIND BY CATEGORY
  it('should return expenses by category', async () => {
    mockPrisma.expense.findMany.mockResolvedValue([{ category: 'FOOD' }]);

    const result = await service.findByCategory('FOOD');

    expect(prisma.expense.findMany).toHaveBeenCalledWith({
      where: { category: 'FOOD' },
    });
    expect(result.length).toBe(1);
  });

  // ✅ GET TOTAL
  it('should return total amount', async () => {
    mockPrisma.expense.aggregate.mockResolvedValue({
      _sum: { amount: 500 },
    });

    const result = await service.getTotal();

    expect(result).toBe(500);
  });

  // ✅ EXPORT EXPENSES (STRING CSV)
  it('should export expenses as CSV string', async () => {
    mockPrisma.expense.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Coffee',
        amount: 150,
        category: 'FOOD',
        date: new Date('2026-02-13'),
      },
    ]);

    const result = await service.exportExpenses(mockUserId);

    expect(result).toContain('Title');
    expect(result).toContain('Coffee');
  });

  // ✅ GENERATE CSV FILE (URL)
  it('should generate CSV file and return URL', async () => {
    mockPrisma.expense.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Coffee',
        amount: 150,
        category: 'FOOD',
        date: new Date('2026-02-13'),
      },
    ]);

    const result = await service.generateCsv(mockUserId);

    expect(result).toContain('http://localhost:3002/exports/');
  });

  // ✅ EXPORT CHART DATA
  it('should export chart data per category', async () => {
    mockPrisma.expense.groupBy.mockResolvedValue([
      {
        category: 'FOOD',
        _sum: { amount: 1000 },
      },
    ]);

    const result = await service.exportChartData(mockUserId);

    expect(result).toContain('http://localhost:3002/exports/');
  });
});
