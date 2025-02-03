DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'subscriptions' 
        AND column_name = 'previous_plan_id'
    ) THEN
        ALTER TABLE subscriptions
        ADD COLUMN previous_plan_id TEXT,
        ADD COLUMN plan_changed_at TIMESTAMP;
    END IF;
END $$; 