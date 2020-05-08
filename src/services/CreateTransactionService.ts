// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getCustomRepository(CategoryRepository);
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError(
        'Your value to outcome is lower than your balance',
        400,
      );
    }
    const verifyCategorie = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!verifyCategorie) {
      const categoryTemplate = categoryRepository.create({
        title: category,
      });
      const categoryValues = await categoryRepository.save(categoryTemplate);
      const transactionTemplate = transactionRepository.create({
        title,
        value,
        category_id: categoryValues.id,
        type,
      });
      const transaction = await transactionRepository.save(transactionTemplate);
      return transaction;
    }
    const transactionTemplate = transactionRepository.create({
      title,
      value,
      category_id: verifyCategorie.id,
      type,
    });
    const transaction = await transactionRepository.save(transactionTemplate);
    return transaction;
  }
}

export default CreateTransactionService;
