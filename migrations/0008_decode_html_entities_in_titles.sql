-- Decode HTML entities that were stored encoded in article titles (e.g. &amp; → &)
UPDATE articles SET title = REPLACE(title, '&amp;', '&') WHERE title LIKE '%&amp;%';
UPDATE articles SET title = REPLACE(title, '&lt;', '<') WHERE title LIKE '%&lt;%';
UPDATE articles SET title = REPLACE(title, '&gt;', '>') WHERE title LIKE '%&gt;%';
UPDATE articles SET title = REPLACE(title, '&quot;', '"') WHERE title LIKE '%&quot;%';
UPDATE articles SET title = REPLACE(title, '&#39;', '''') WHERE title LIKE '%&#39;%';
UPDATE articles SET title = REPLACE(title, '&apos;', '''') WHERE title LIKE '%&apos;%';

-- Same for feed names
UPDATE feeds SET name = REPLACE(name, '&amp;', '&') WHERE name LIKE '%&amp;%';
UPDATE feeds SET name = REPLACE(name, '&lt;', '<') WHERE name LIKE '%&lt;%';
UPDATE feeds SET name = REPLACE(name, '&gt;', '>') WHERE name LIKE '%&gt;%';
UPDATE feeds SET name = REPLACE(name, '&quot;', '"') WHERE name LIKE '%&quot;%';
UPDATE feeds SET name = REPLACE(name, '&#39;', '''') WHERE name LIKE '%&#39;%';
UPDATE feeds SET name = REPLACE(name, '&apos;', '''') WHERE name LIKE '%&apos;%';
