DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'canceled_at'
    ) THEN
        ALTER TABLE "subscriptions" ADD COLUMN "canceled_at" timestamp;
    END IF;
END $$; 