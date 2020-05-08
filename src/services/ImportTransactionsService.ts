import fs from 'fs';
import csvParser from 'csv-parse';
import { getRepository, getCustomRepository, In } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute(FilenameCSV: string): Promise<Transaction[]> {
    // TODO
    const categoryRepo = getRepository(Category);
    const transactionRepo = getCustomRepository(TransactionsRepository);
    const contactsReadStream = fs.createReadStream(FilenameCSV);
    const parser = csvParser({
      delimiter: ',',
      from_line: 2,
    });
    const parseCSV = contactsReadStream.pipe(parser);
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      if (!title || !type || !value || !category) return;
      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    await new Promise(resolve => parseCSV.on('end', resolve));
    const categoryExist = await categoryRepo.find({
      where: { title: In(categories) },
    });
    const existentCategoriesTitles = categoryExist.map(
      (catego: Category) => catego.title,
    );
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepo.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );
    const newCategoriesIds = await categoryRepo
      .save(newCategories)
      .then(response => {
        const newCategoObj = response.map(categ => ({
          id: categ.id,
          title: categ.title,
        }));
        return newCategoObj;
      });

    const categoryExistNameandTitle = categoryExist.map(catego => ({
      title: catego.title,
      id: catego.id,
    }));
    const categoriesIds = [...newCategoriesIds, ...categoryExistNameandTitle];
    // falta uma maneira de diferir qual id e de qualspotifuoc transaçao
    const createdTransaction = transactionRepo.create(
      transactions.map(transaction => {
        const idCategorie = categoriesIds.find(
          catego => catego.title === transaction.category,
        );
        return {
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category_id: idCategorie?.id,
        };
      }),
    );
    await transactionRepo.save(createdTransaction);
    await fs.promises.unlink(FilenameCSV);
    return createdTransaction;
  }
}

export default ImportTransactionsService;
