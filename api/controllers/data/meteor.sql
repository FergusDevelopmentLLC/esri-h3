COPY (
	SELECT h3_01.id, count(*) as meteor_count
	from h3_01
	JOIN na_meteor ON st_contains(h3_01.geom, na_meteor.geom)
	GROUP BY h3_01.id
	ORDER BY count(*)
     )
To '/tmp/h3_01_data.csv' With CSV DELIMITER ',';

COPY (
	SELECT h3_02.id, count(*) as meteor_count
	from h3_02
	JOIN na_meteor ON st_contains(h3_02.geom, na_meteor.geom)
	GROUP BY h3_02.id
	ORDER BY count(*)
     )
To '/tmp/h3_02_data.csv' With CSV DELIMITER ',';

COPY (
	SELECT h3_03.id, count(*) as meteor_count
	from h3_03
	JOIN na_meteor ON st_contains(h3_03.geom, na_meteor.geom)
	GROUP BY h3_03.id
	ORDER BY count(*)
     )
To '/tmp/h3_03_data.csv' With CSV DELIMITER ',';

COPY (
	SELECT h3_04.id, count(*) as meteor_count
	from h3_04
	JOIN na_meteor ON st_contains(h3_04.geom, na_meteor.geom)
	GROUP BY h3_04.id
	ORDER BY count(*)
     )
To '/tmp/h3_04_data.csv' With CSV DELIMITER ',';

COPY (
	SELECT h3_05.id, count(*) as meteor_count
	from h3_05
	JOIN na_meteor ON st_contains(h3_05.geom, na_meteor.geom)
	GROUP BY h3_05.id
	ORDER BY count(*)
     )
To '/tmp/h3_05_data.csv' With CSV DELIMITER ',';

#http://www.convertcsv.com/csv-to-json.htm
