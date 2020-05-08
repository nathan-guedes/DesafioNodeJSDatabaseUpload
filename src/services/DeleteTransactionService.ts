import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // TODO
    const transaRepo = getCustomRepository(TransactionsRepository);
    const deleted = await transaRepo.delete(id);
    if (deleted.affected === 0) {
      throw new AppError('Not Found a transaction with this id');
    }
  }
}

export default DeleteTransactionService;
