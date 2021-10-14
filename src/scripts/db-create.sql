-- SCHEMA: shopify

DROP SCHEMA shopify ;

CREATE SCHEMA shopify
    AUTHORIZATION stanley;

-- FUNCTION: shopify.update_modified_column()

-- DROP FUNCTION shopify.update_modified_column();

CREATE FUNCTION shopify.update_modified_column()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
    NEW.modified_at = now();
    RETURN NEW;   
END;
$BODY$;

ALTER FUNCTION shopify.update_modified_column()
    OWNER TO stanley;

-- Table: shopify.shop

-- DROP TABLE shopify.shop;

CREATE TABLE IF NOT EXISTS shopify.shop
(
    shop_domain text COLLATE pg_catalog."default" NOT NULL,
    fulfillment_service_id text COLLATE pg_catalog."default",
    fulfillment_location_id text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT shop_pkey PRIMARY KEY (shop_domain)
)

TABLESPACE pg_default;

ALTER TABLE shopify.shop
    OWNER to stanley;

-- Trigger: update_shop_modtime

-- DROP TRIGGER update_shop_modtime ON shopify.shop;

CREATE TRIGGER update_shop_modtime
    BEFORE UPDATE 
    ON shopify.shop
    FOR EACH ROW
    EXECUTE FUNCTION shopify.update_modified_column();

-- Table: shopify.settings

-- DROP TABLE shopify.settings;

CREATE TABLE IF NOT EXISTS shopify.settings
(
    shop_domain text COLLATE pg_catalog."default" NOT NULL,
    capsule_username text COLLATE pg_catalog."default" NOT NULL,
    capsule_api_key text COLLATE pg_catalog."default" NOT NULL,
    capsule_brand_id text COLLATE pg_catalog."default",
    environment text COLLATE pg_catalog."default" DEFAULT 'development'::text,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT settings_pkey PRIMARY KEY (shop_domain),
    CONSTRAINT settings_shop_domain_fkey FOREIGN KEY (shop_domain)
        REFERENCES shopify.shop (shop_domain) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT check_environment CHECK (environment = ANY (ARRAY['production'::text, 'development'::text, 'sandbox'::text]))
)

TABLESPACE pg_default;

ALTER TABLE shopify.settings
    OWNER to stanley;

-- Trigger: update_settings_modtime

-- DROP TRIGGER update_settings_modtime ON shopify.settings;

CREATE TRIGGER update_settings_modtime
    BEFORE UPDATE 
    ON shopify.settings
    FOR EACH ROW
    EXECUTE FUNCTION shopify.update_modified_column();

-- Table: shopify.session

-- DROP TABLE shopify.session;

CREATE TABLE IF NOT EXISTS shopify.session
(
    id text COLLATE pg_catalog."default" NOT NULL,
    shop_domain text COLLATE pg_catalog."default" NOT NULL,
    scope text COLLATE pg_catalog."default",
    state text COLLATE pg_catalog."default",
    is_online boolean NOT NULL,
    access_token text COLLATE pg_catalog."default",
    expires timestamp with time zone,
    online_access_info text COLLATE pg_catalog."default",
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT session_pkey PRIMARY KEY (id),
    CONSTRAINT session_shop_domain_fkey FOREIGN KEY (shop_domain)
        REFERENCES shopify.shop (shop_domain) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE shopify.session
    OWNER to stanley;

-- Trigger: update_settings_modtime

-- DROP TRIGGER update_settings_modtime ON shopify.session;

CREATE TRIGGER update_settings_modtime
    BEFORE UPDATE 
    ON shopify.session
    FOR EACH ROW
    EXECUTE FUNCTION shopify.update_modified_column();