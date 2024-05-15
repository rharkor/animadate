CREATE SEQUENCE user_id_seq;

CREATE OR REPLACE FUNCTION generate_random_social_id() RETURNS text AS $$
DECLARE
    random_part int;
    sequence_part bigint;
BEGIN
    random_part := (RANDOM() * 9999)::int;  -- Generates a random number from 0 to 9999
    sequence_part := nextval('user_id_seq');  -- Gets the next unique value from the sequence

    -- Return a formatted string where the random number is zero-padded to 4 digits and appended with the sequence value
    RETURN lpad(random_part::text, 4, '0') || sequence_part::text;
END;
$$ LANGUAGE plpgsql;
