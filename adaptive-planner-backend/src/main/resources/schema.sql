-- Idempotent Phase 1 schema guard. Hibernate creates/updates the table first;
-- this index makes routine occurrence materialization database-enforced.
CREATE UNIQUE INDEX IF NOT EXISTS uk_time_blocks_routine_occurrence
    ON time_blocks (source_routine_id, event_date);
