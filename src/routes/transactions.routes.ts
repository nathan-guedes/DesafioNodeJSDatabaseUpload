import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  // TODO
  const transaRepo = getCustomRepository(TransactionsRepository);
  const transactions = await transaRepo.find();
  const balance = await transaRepo.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  // TODO
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();

  const Transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(Transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);
  return response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    // TODO

    const importTransService = new ImportTransactionsService();
    const transaction = await importTransService.execute(request.file.path);
    return response.json(transaction);
  },
);

export default transactionsRouter;
