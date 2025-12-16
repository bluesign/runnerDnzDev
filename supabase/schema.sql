-- User Snippets Table
CREATE TABLE IF NOT EXISTS user_snippets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT CHECK (type IN ('script', 'transaction')) NOT NULL,
    network TEXT CHECK (network IN ('mainnet', 'testnet')) NOT NULL,
    folder_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Folders Table
CREATE TABLE IF NOT EXISTS user_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    parent_path TEXT NOT NULL,
    network TEXT CHECK (network IN ('mainnet', 'testnet')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_folders ENABLE ROW LEVEL SECURITY;

-- Create policies for user_snippets
CREATE POLICY "Users can view their own snippets"
    ON user_snippets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own snippets"
    ON user_snippets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets"
    ON user_snippets FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets"
    ON user_snippets FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for user_folders
CREATE POLICY "Users can view their own folders"
    ON user_folders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own folders"
    ON user_folders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
    ON user_folders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
    ON user_folders FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS user_snippets_user_id_idx ON user_snippets(user_id);
CREATE INDEX IF NOT EXISTS user_snippets_network_idx ON user_snippets(network);
CREATE INDEX IF NOT EXISTS user_folders_user_id_idx ON user_folders(user_id);
CREATE INDEX IF NOT EXISTS user_folders_network_idx ON user_folders(network);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_snippets_updated_at
    BEFORE UPDATE ON user_snippets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
