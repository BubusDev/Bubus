CREATE TABLE "ConsentLog" (
    "id" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "version" INTEGER NOT NULL,
    "userAgent" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentLog_createdAt_idx" ON "ConsentLog"("createdAt");
