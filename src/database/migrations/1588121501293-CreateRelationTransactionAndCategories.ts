import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateRelationTransactionAndCategories1588121501293
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'transactionCategory',
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'Set Null',
        onUpdate: 'Cascade',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'transactionCategory');
  }
}
