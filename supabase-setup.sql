-- TODO 앱을 위한 Supabase 테이블 생성 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. todos 테이블 생성
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium' NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  category VARCHAR(20) DEFAULT 'personal' NOT NULL CHECK (category IN ('work', 'personal', 'health', 'shopping', 'learning')),
  due_date DATE,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_order_index ON todos(order_index);

-- 3. 전체 텍스트 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_search ON todos USING gin(to_tsvector('korean', title || ' ' || COALESCE(description, '')));

-- 4. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS (Row Level Security) 활성화 (선택사항 - 사용자별 데이터 분리가 필요한 경우)
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 7. 샘플 데이터 삽입 (테스트용)
INSERT INTO todos (title, description, priority, category, due_date) VALUES
('프로젝트 기획서 작성', '2025년 신규 프로젝트 기획서를 작성해야 합니다.', 'high', 'work', '2025-01-15'),
('운동하기', '주 3회 이상 운동하기', 'medium', 'health', NULL),
('장보기', '주말 장보기 - 우유, 빵, 과일', 'low', 'shopping', '2025-01-10'),
('React 공부', 'Next.js 15 새로운 기능 학습', 'medium', 'learning', '2025-01-20'),
('친구 만나기', '오랜만에 친구들과 만나서 식사하기', 'low', 'personal', '2025-01-12');

-- 8. 테이블 정보 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'todos' 
ORDER BY ordinal_position;

-- 9. 생성된 데이터 확인
SELECT * FROM todos ORDER BY created_at DESC;
