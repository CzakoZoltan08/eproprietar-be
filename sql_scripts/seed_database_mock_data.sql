-- Insert mock data for Users
INSERT INTO "user" (id, firebase_id, stripe_customer_id, role, email, created_at, updated_at, first_name, last_name, phone_number, auth_provider, favourites) 
VALUES 
  (gen_random_uuid(), 'firebase_001', 'stripe_001', 'admin', 'admin@example.com', NOW(), NOW(), 'John', 'Doe', '1234567890', 'google.com', '[]'),
  (gen_random_uuid(), 'firebase_002', 'stripe_002', 'user', 'user1@example.com', NOW(), NOW(), 'Jane', 'Smith', '9876543210', 'email', '[]'),
  (gen_random_uuid(), 'firebase_003', 'stripe_003', 'user', 'user2@example.com', NOW(), NOW(), 'Alice', 'Johnson', '1231231234', 'google.com', '[]'),
  (gen_random_uuid(), 'firebase_004', 'stripe_004', 'agent', 'agent@example.com', NOW(), NOW(), 'Bob', 'Brown', '4564564567', 'email', '[]');

-- Insert mock data for Agencies
INSERT INTO "agency" (id, name, description, image, link) 
VALUES 
  (gen_random_uuid(), 'Top Realty', 'Leading real estate agency', 'image1.jpg', 'https://toprealty.com'),
  (gen_random_uuid(), 'Prime Properties', 'Best properties in town', 'image2.jpg', 'https://primeproperties.com'),
  (gen_random_uuid(), 'Elite Estates', 'Exclusive high-end properties', 'image3.jpg', 'https://eliteestates.com');

-- Insert mock data for Announcements
INSERT INTO "announcement" (id, announcement_type, provider_type, transaction_type, title, city, street, price, deleted, currency, apartament_partitioning, status, comfort_level, rooms, number_of_kitchens, surface, schema, description, partitioning, baths, floor, is_new, balcony, parking, stage, end_date, is_exclusivity, user_id, agency_id, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'apartament', 'owner', 'Vanzare', 'Modern Apartment', 'New York', '5th Ave', 250000, false, 'usd', 'Decomandat', 'active', 'High', 3, 1, 120, 'schema1', 'Beautiful apartment in the heart of the city.', 'Open', 2, 5, true, 'LARGE', 'GARAGE', 'Completed', '2025-12-31', true, (SELECT id FROM "user" WHERE email='admin@example.com'), (SELECT id FROM "agency" WHERE name='Top Realty'), NOW(), NOW()),
  (gen_random_uuid(), 'casa', 'agency', 'Inchiriere', 'Luxury Condo', 'Los Angeles', 'Sunset Blvd', 500000, false, 'euro', 'Decomandat', 'active', 'Luxury', 5, 2, 200, 'schema2', 'Spacious condo with a stunning view.', 'Partitioned', 4, 10, true, 'SMALL', 'STREET', 'In Progress', '2026-06-15', false, (SELECT id FROM "user" WHERE email='user1@example.com'), (SELECT id FROM "agency" WHERE name='Prime Properties'), NOW(), NOW()),
  (gen_random_uuid(), 'apartament', 'owner', 'Vanzare', 'Cozy Studio', 'Miami', 'Ocean Dr', 150000, false, 'usd', 'Decomandat', 'active', 'Medium', 1, 1, 50, 'schema3', 'Perfect for singles or couples.', 'Studio', 1, 2, false, 'NONE', 'STREET', 'Available', '2024-09-01', true, (SELECT id FROM "user" WHERE email='user2@example.com'), (SELECT id FROM "agency" WHERE name='Elite Estates'), NOW(), NOW());

-- Insert mock data for Subscriptions
INSERT INTO "subscription" (stripe_id, expires_at, created_at, shipping_address, price, discount)
VALUES 
  ('sub_001', NOW() + INTERVAL '1 year', NOW(), '123 Main St, NY, USA', 100, 10),
  ('sub_002', NOW() + INTERVAL '6 months', NOW(), '456 Elm St, LA, USA', 150, 15),
  ('sub_003', NOW() + INTERVAL '2 years', NOW(), '789 Pine St, Miami, USA', 200, 20);