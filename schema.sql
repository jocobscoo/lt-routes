-- schema.sql
CREATE TABLE IF NOT EXISTS holds (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    house TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    created_by TEXT,
    updated_at INTEGER NOT NULL
);

-- İleride Sequence aralıklarını JSON'dan çıkarıp buluta alırsak kullanacağımız tablo (Şimdilik hazır dursun)
CREATE TABLE IF NOT EXISTS sequences (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL,
    stop_no TEXT NOT NULL,
    seq_start INTEGER NOT NULL,
    seq_end INTEGER NOT NULL,
    created_by TEXT,
    updated_at INTEGER NOT NULL
);
