/*Change the sql_mode to be less strict, allow 0 in date */
SET GLOBAL sql_mode = STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SESSION sql_mode = STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

/* Apply the optimization indexes to the properties table */
ALTER TABLE rets_property ADD INDEX idx_city (L_City);
ALTER TABLE rets_property ADD INDEX idx_zipcode (L_Zip);
ALTER TABLE rets_property ADD INDEX idx_system_price (L_SystemPrice);
CREATE INDEX idx_bed_bath ON rets_property (L_Keyword2, LM_Dec_3);
CREATE INDEX idx_city_price ON [your_table_name] (L_City, L_SystemPrice);
