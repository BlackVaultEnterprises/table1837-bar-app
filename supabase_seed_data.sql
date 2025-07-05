-- Table 1837 Bar Web App - Seed Data
-- This file contains initial test data for development and testing

-- Insert sample wines
INSERT INTO wines (name, type, vintage, region, price, description) VALUES
('Caymus Cabernet Sauvignon', 'red', 2021, 'Napa Valley, California', 89.00, 'Rich and bold with dark fruit flavors and smooth tannins'),
('Kendall-Jackson Vintner''s Reserve Chardonnay', 'white', 2022, 'California', 24.00, 'Crisp and elegant with notes of tropical fruit and vanilla'),
('Dom Pérignon', 'sparkling', 2013, 'Champagne, France', 220.00, 'Prestigious champagne with complex flavors and fine bubbles'),
('Opus One', 'red', 2019, 'Napa Valley, California', 450.00, 'Premium Bordeaux-style blend with exceptional depth and complexity'),
('Sancerre Les Romains', 'white', 2021, 'Loire Valley, France', 45.00, 'Mineral-driven Sauvignon Blanc with citrus and herb notes'),
('Barolo Brunate', 'red', 2018, 'Piedmont, Italy', 85.00, 'Traditional Nebbiolo with rose petal aromas and structured tannins'),
('Chablis Premier Cru', 'white', 2020, 'Burgundy, France', 55.00, 'Crisp and mineral with green apple and oyster shell notes'),
('Amarone della Valpolicella', 'red', 2017, 'Veneto, Italy', 75.00, 'Rich and concentrated with dried fruit and spice flavors');

-- Insert sample cocktails
INSERT INTO cocktails (name, ingredients, recipe, price, type, is_signature) VALUES
('The Fig Old Fashioned', 'Bourbon, fig syrup, Angostura bitters, orange peel', 'Muddle fig syrup with bitters, add bourbon, stir with ice, garnish with orange peel', 16.00, 'signature', true),
('Classic Negroni', 'Gin, Campari, sweet vermouth', 'Equal parts gin, Campari, and sweet vermouth, stirred with ice, garnished with orange peel', 14.00, 'classic', false),
('Smoked Manhattan', 'Rye whiskey, sweet vermouth, cherry bitters, smoked cherry', 'Stir rye and vermouth with bitters, serve in smoked glass with cherry', 18.00, 'signature', true),
('Cucumber Basil Gimlet', 'Gin, lime juice, cucumber, basil, simple syrup', 'Muddle cucumber and basil, add gin and lime, shake with ice', 15.00, 'seasonal', false),
('Espresso Martini', 'Vodka, coffee liqueur, fresh espresso, simple syrup', 'Shake all ingredients with ice, double strain, garnish with coffee beans', 16.00, 'classic', false),
('Lavender Bee''s Knees', 'Gin, honey syrup, lemon juice, lavender', 'Shake gin, honey syrup, and lemon with ice, garnish with dried lavender', 17.00, 'signature', true),
('Mezcal Paloma', 'Mezcal, grapefruit juice, lime juice, agave nectar, salt rim', 'Shake mezcal, juices, and agave, serve with salted rim and grapefruit wheel', 15.00, 'seasonal', false),
('Blood Orange Boulevardier', 'Bourbon, Campari, sweet vermouth, blood orange juice', 'Stir bourbon, Campari, and vermouth, add blood orange juice, garnish with orange twist', 16.00, 'signature', true);

-- Insert sample specials
INSERT INTO specials (name, description, price, type, start_date, end_date, is_active) VALUES
('Happy Hour Wine Flight', 'Three 2oz pours of featured wines', 18.00, 'happy_hour', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('Oyster & Champagne Special', 'Half dozen oysters with glass of champagne', 32.00, 'daily', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
('Weekend Brunch Cocktails', '50% off select brunch cocktails', 0.00, 'weekend', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', true),
('Wine Wednesday', '25% off all wines by the bottle', 0.00, 'weekly', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true),
('Craft Cocktail Tasting', 'Four 1oz pours of signature cocktails', 25.00, 'weekly', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', true);

-- Insert sample menu (for OCR testing)
INSERT INTO menus (title, image_url, ocr_raw_text, ocr_processed_text, is_featured) VALUES
('Winter Wine Menu', 'https://example.com/winter-menu.jpg', 'Raw OCR text would go here...', 'Processed and cleaned menu data...', true),
('Signature Cocktails Menu', 'https://example.com/cocktail-menu.jpg', 'Raw cocktail menu OCR...', 'Processed cocktail menu data...', false);

-- Note: No initial 86'd items - these will be added dynamically through the admin panel

