-- Phase 2 intentionally starts the financial area over. Authentication and
-- system categories stay in place; user financial data is recreated below.
DROP TABLE "transactions";
DROP TABLE "bank_accounts";
DELETE FROM "budgets";
DELETE FROM "categories" WHERE "userId" IS NOT NULL;

CREATE TYPE "InstitutionKind" AS ENUM ('BANK', 'PAYMENT_INSTITUTION', 'BROKERAGE', 'BENEFITS', 'OTHER');
CREATE TYPE "FinancialAccountType" AS ENUM ('CHECKING', 'PAYMENT', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'FOOD_BENEFIT', 'MEAL_BENEFIT', 'FLEX_BENEFIT', 'CASH', 'OTHER');
CREATE TYPE "TransactionKind" AS ENUM ('REGULAR', 'BALANCE_ADJUSTMENT');

CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "InstitutionKind" NOT NULL,
    "icon" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "financial_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "institutionId" TEXT,
    "name" TEXT NOT NULL,
    "type" "FinancialAccountType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "financialAccountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "kind" "TransactionKind" NOT NULL DEFAULT 'REGULAR',
    "amount" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "institutions_slug_key" ON "institutions"("slug");
CREATE INDEX "institutions_kind_idx" ON "institutions"("kind");
CREATE INDEX "institutions_userId_idx" ON "institutions"("userId");
CREATE INDEX "financial_accounts_userId_institutionId_idx" ON "financial_accounts"("userId", "institutionId");
CREATE INDEX "transactions_financialAccountId_date_idx" ON "transactions"("financialAccountId", "date");
CREATE INDEX "transactions_categoryId_date_idx" ON "transactions"("categoryId", "date");

ALTER TABLE "institutions" ADD CONSTRAINT "institutions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "financial_accounts" ADD CONSTRAINT "financial_accounts_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_financialAccountId_fkey" FOREIGN KEY ("financialAccountId") REFERENCES "financial_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
