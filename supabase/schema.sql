-- =============================================
-- Retro Album - Supabase スキーマ定義
-- =============================================

-- profiles テーブル
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- albums テーブル
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  bgm_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- album_items テーブル
CREATE TABLE IF NOT EXISTS album_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('photo', 'video')) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  date_label TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- v2 migration: date_label カラムを追加（既存DBへの適用）
ALTER TABLE album_items ADD COLUMN IF NOT EXISTS date_label TEXT;

-- messages テーブル
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- インデックス
-- =============================================
CREATE INDEX IF NOT EXISTS albums_user_id_idx ON albums(user_id);
CREATE INDEX IF NOT EXISTS album_items_album_id_idx ON album_items(album_id);
CREATE INDEX IF NOT EXISTS album_items_sort_order_idx ON album_items(album_id, sort_order);
CREATE INDEX IF NOT EXISTS messages_album_id_idx ON messages(album_id);
CREATE INDEX IF NOT EXISTS messages_sort_order_idx ON messages(album_id, sort_order);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

-- RLS を有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- albums ポリシー
CREATE POLICY "Users can view own album"
  ON albums FOR SELECT
  USING (auth.uid() = user_id);

-- album_items ポリシー
CREATE POLICY "Users can view own album items"
  ON album_items FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums WHERE user_id = auth.uid()
    )
  );

-- messages ポリシー
CREATE POLICY "Users can view own album messages"
  ON messages FOR SELECT
  USING (
    album_id IN (
      SELECT id FROM albums WHERE user_id = auth.uid()
    )
  );

-- =============================================
-- Storage バケット
-- =============================================

-- album-photos バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('album-photos', 'album-photos', false)
ON CONFLICT (id) DO NOTHING;

-- album-videos バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('album-videos', 'album-videos', false)
ON CONFLICT (id) DO NOTHING;

-- bgm バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('bgm', 'bgm', false)
ON CONFLICT (id) DO NOTHING;

-- avatars バケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS ポリシー（album-photos）
CREATE POLICY "Users can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'album-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS ポリシー（album-videos）
CREATE POLICY "Users can view own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'album-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage RLS ポリシー（bgm - 認証済みユーザーは全員閲覧可）
CREATE POLICY "Authenticated users can view bgm"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'bgm' AND
    auth.role() = 'authenticated'
  );

-- Storage RLS ポリシー（avatars）
CREATE POLICY "Users can view own avatar"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- profiles の自動作成トリガー
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
