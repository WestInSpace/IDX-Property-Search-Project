/*Change the sql_mode to be less strict, allow 0 in date */
SET GLOBAL sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

/* Apply the optimization indexes to the properties table */
CREATE INDEX idx_L_ListingID ON rets_property (L_ListingID);
CREATE INDEX idx_city_id ON rets_property (L_City, id DESC);
CREATE INDEX idx_zip_id ON rets_property (L_Zip, id DESC);
CREATE INDEX idx_price_id ON rets_property (L_SystemPrice, id DESC);
CREATE INDEX idx_bed_bath_id ON rets_property (L_Keyword2, LM_Dec_3, id DESC);
CREATE INDEX idx_city_price_id ON rets_property (L_City, L_SystemPrice, id DESC);
