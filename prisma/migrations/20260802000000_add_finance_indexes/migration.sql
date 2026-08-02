CREATE INDEX "bank_accounts_userId_idx" ON "bank_accounts"("userId");
CREATE INDEX "categories_userId_type_idx" ON "categories"("userId", "type");
CREATE INDEX "transactions_bankAccountId_date_idx" ON "transactions"("bankAccountId", "date");
CREATE INDEX "transactions_categoryId_date_idx" ON "transactions"("categoryId", "date");
