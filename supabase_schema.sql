-- Table 1837 Bar Web App - Supabase Database Schema
-- This file contains the complete database schema for the bar management system

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables

-- 1. Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Wines table
CREATE TABLE IF NOT EXISTS wines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- red, white, sparkling, etc.
    vintage INTEGER,
    region VARCHAR(255),
    price DECIMAL(10,2),
    description TEXT,
    is_86d BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Cocktails table
CREATE TABLE IF NOT EXISTS cocktails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ingredients TEXT NOT NULL,
    recipe TEXT,
    price DECIMAL(10,2),
    type VARCHAR(100), -- signature, classic, seasonal, etc.
    is_signature BOOLEAN DEFAULT FALSE,
    is_86d BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Specials table
CREATE TABLE IF NOT EXISTS specials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    type VARCHAR(100), -- daily, weekly, happy_hour, etc.
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 86'd Items tracking table
CREATE TABLE IF NOT EXISTS eighty_sixed_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100) NOT NULL, -- wine, cocktail, special
    item_id UUID, -- Reference to the actual item
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Menus table for OCR processed images
CREATE TABLE IF NOT EXISTS menus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    ocr_raw_text TEXT,
    ocr_processed_text TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wines_type ON wines(type);
CREATE INDEX IF NOT EXISTS idx_wines_is_86d ON wines(is_86d);
CREATE INDEX IF NOT EXISTS idx_cocktails_type ON cocktails(type);
CREATE INDEX IF NOT EXISTS idx_cocktails_is_signature ON cocktails(is_signature);
CREATE INDEX IF NOT EXISTS idx_cocktails_is_86d ON cocktails(is_86d);
CREATE INDEX IF NOT EXISTS idx_specials_is_active ON specials(is_active);
CREATE INDEX IF NOT EXISTS idx_specials_dates ON specials(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_eighty_sixed_timestamp ON eighty_sixed_items(timestamp);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cocktails ENABLE ROW LEVEL SECURITY;
ALTER TABLE specials ENABLE ROW LEVEL SECURITY;
ALTER TABLE eighty_sixed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users table - Only authenticated users can access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Wines table - Public read, admin write
CREATE POLICY "Anyone can view wines" ON wines
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert wines" ON wines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update wines" ON wines
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete wines" ON wines
    FOR DELETE USING (auth.role() = 'authenticated');

-- Cocktails table - Public read, admin write
CREATE POLICY "Anyone can view cocktails" ON cocktails
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert cocktails" ON cocktails
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cocktails" ON cocktails
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cocktails" ON cocktails
    FOR DELETE USING (auth.role() = 'authenticated');

-- Specials table - Public read, admin write
CREATE POLICY "Anyone can view specials" ON specials
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert specials" ON specials
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update specials" ON specials
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete specials" ON specials
    FOR DELETE USING (auth.role() = 'authenticated');

-- 86'd Items table - Public read, admin write
CREATE POLICY "Anyone can view 86d items" ON eighty_sixed_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert 86d items" ON eighty_sixed_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update 86d items" ON eighty_sixed_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete 86d items" ON eighty_sixed_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Menus table - Public read, admin write
CREATE POLICY "Anyone can view menus" ON menus
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert menus" ON menus
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update menus" ON menus
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete menus" ON menus
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wines_updated_at BEFORE UPDATE ON wines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cocktails_updated_at BEFORE UPDATE ON cocktails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_specials_updated_at BEFORE UPDATE ON specials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

