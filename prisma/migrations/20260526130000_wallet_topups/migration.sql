-- CreateEnum
CREATE TYPE "TopUpStatus" AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "bitcoin_wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "autoRenewPlan" TEXT,
    "autoRenewEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bitcoin_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bitcoin_top_ups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "usdCents" INTEGER NOT NULL,
    "btcAddress" TEXT NOT NULL,
    "satoshis" INTEGER NOT NULL,
    "status" "TopUpStatus" NOT NULL DEFAULT 'PENDING',
    "txid" TEXT,
    "adminNote" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitcoin_top_ups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bitcoin_wallets_userId_key" ON "bitcoin_wallets"("userId");

-- CreateIndex
CREATE INDEX "bitcoin_top_ups_userId_idx" ON "bitcoin_top_ups"("userId");

-- CreateIndex
CREATE INDEX "bitcoin_top_ups_status_idx" ON "bitcoin_top_ups"("status");

-- AddForeignKey
ALTER TABLE "bitcoin_wallets" ADD CONSTRAINT "bitcoin_wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitcoin_top_ups" ADD CONSTRAINT "bitcoin_top_ups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitcoin_top_ups" ADD CONSTRAINT "bitcoin_top_ups_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "bitcoin_wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
