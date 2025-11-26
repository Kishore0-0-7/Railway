--
-- PostgreSQL database dump
--

\restrict 6QvifzeEI4dmh3hZ95YGSQIDikHVs1ftY5TiFdfEZW0j7FVH5BfPAacgOpgKkhn

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-11-15 18:12:08 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS railway;
--
-- TOC entry 3480 (class 1262 OID 17719)
-- Name: railway; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE railway WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE railway OWNER TO postgres;

\unrestrict 6QvifzeEI4dmh3hZ95YGSQIDikHVs1ftY5TiFdfEZW0j7FVH5BfPAacgOpgKkhn
\connect railway
\restrict 6QvifzeEI4dmh3hZ95YGSQIDikHVs1ftY5TiFdfEZW0j7FVH5BfPAacgOpgKkhn

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 215 (class 1259 OID 17720)
-- Name: admin_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_accounts (
    admin_id character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    mobile_number character varying(15),
    password_hash text NOT NULL,
    role character varying(50) DEFAULT 'Admin'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT admin_accounts_role_check CHECK (((role)::text = 'Admin'::text))
);


ALTER TABLE public.admin_accounts OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 17755)
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    booking_id character varying(50) NOT NULL,
    admin_id character varying(20) NOT NULL,
    worker_id character varying(20) NOT NULL,
    guest_name character varying(100) NOT NULL,
    phone_number character varying(15) NOT NULL,
    number_of_persons integer NOT NULL,
    booking_type character varying(50) NOT NULL,
    total_hours integer NOT NULL,
    booking_date date NOT NULL,
    in_time time without time zone NOT NULL,
    out_time time without time zone,
    proof_type character varying(50) NOT NULL,
    proof_id character varying(50) NOT NULL,
    price_per_person numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0,
    balance_amount numeric(12,2),
    payment_method character varying(50) DEFAULT 'cash'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 33613)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    admin_id character varying(100) NOT NULL,
    admin_name character varying(100) NOT NULL,
    hall_name character varying(100) NOT NULL,
    type1 character varying(50) DEFAULT NULL::character varying,
    type1_amount numeric(10,2) DEFAULT NULL::numeric,
    type2 character varying(50) DEFAULT NULL::character varying,
    type2_amount numeric(10,2) DEFAULT NULL::numeric,
    type3 character varying(50) DEFAULT NULL::character varying,
    type3_amount numeric(10,2) DEFAULT NULL::numeric,
    type4 character varying(50) DEFAULT NULL::character varying,
    type4_amount numeric(10,2) DEFAULT NULL::numeric,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    advance_payment_enabled integer DEFAULT 1 NOT NULL,
    default_advance_percentage numeric(5,2) DEFAULT 20.00,
    CONSTRAINT settings_advance_payment_enabled_check CHECK ((advance_payment_enabled = ANY (ARRAY[0, 1]))),
    CONSTRAINT settings_default_advance_percentage_check CHECK (((default_advance_percentage >= (0)::numeric) AND (default_advance_percentage <= (100)::numeric)))
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 3481 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN settings.advance_payment_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.advance_payment_enabled IS 'Flag to enable (1) or disable (0) advance payment feature';


--
-- TOC entry 3482 (class 0 OID 0)
-- Dependencies: 219
-- Name: COLUMN settings.default_advance_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.default_advance_percentage IS 'Default percentage for advance payment (0-100)';


--
-- TOC entry 218 (class 1259 OID 33612)
-- Name: hall_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hall_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hall_details_id_seq OWNER TO postgres;

--
-- TOC entry 3483 (class 0 OID 0)
-- Dependencies: 218
-- Name: hall_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hall_details_id_seq OWNED BY public.settings.id;


--
-- TOC entry 221 (class 1259 OID 33637)
-- Name: super_admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admin (
    super_admin_id integer NOT NULL,
    super_admin_name character varying(100) NOT NULL,
    phone_number character varying(15) NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.super_admin OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 33636)
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.super_admin_super_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.super_admin_super_admin_id_seq OWNER TO postgres;

--
-- TOC entry 3484 (class 0 OID 0)
-- Dependencies: 220
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.super_admin_super_admin_id_seq OWNED BY public.super_admin.super_admin_id;


--
-- TOC entry 216 (class 1259 OID 17735)
-- Name: worker_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_accounts (
    worker_id character varying(20) NOT NULL,
    admin_id character varying(20) NOT NULL,
    full_name character varying(100) NOT NULL,
    mobile_number character varying(15) NOT NULL,
    joining_date date NOT NULL,
    gender character varying(10),
    user_name character varying(100) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    worker_status character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT worker_accounts_gender_check CHECK (((gender)::text = ANY ((ARRAY['Male'::character varying, 'Female'::character varying, 'Other'::character varying])::text[]))),
    CONSTRAINT worker_accounts_joining_date_check CHECK ((joining_date <= CURRENT_DATE)),
    CONSTRAINT worker_accounts_worker_status_check CHECK (((worker_status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.worker_accounts OWNER TO postgres;

--
-- TOC entry 3277 (class 2604 OID 33616)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.hall_details_id_seq'::regclass);


--
-- TOC entry 3290 (class 2604 OID 33640)
-- Name: super_admin super_admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin ALTER COLUMN super_admin_id SET DEFAULT nextval('public.super_admin_super_admin_id_seq'::regclass);


--
-- TOC entry 3468 (class 0 OID 17720)
-- Dependencies: 215
-- Data for Name: admin_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_accounts VALUES ('ADM001', 'erode', 'erode@gmail.com', '9865911972', '$2b$10$mWAMwTNhv1DSWxqOc60or.hpyjA1JM2gKAERYSAhmPjJjhl8zF/RK', 'Admin', '2025-11-15 12:39:11.063684+00', '2025-11-15 12:39:11.063684+00') ON CONFLICT DO NOTHING;


--
-- TOC entry 3470 (class 0 OID 17755)
-- Dependencies: 217
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3472 (class 0 OID 33613)
-- Dependencies: 219
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.settings VALUES (7, 'ADM001', 'erode', 'Default Hall', 'Sitting', 100.00, 'Sleeper', 150.00, 'AC', 200.00, 'Premium', 250.00, '2025-11-15 12:39:11.063684', '2025-11-15 12:39:11.063684', 0, 0.00) ON CONFLICT DO NOTHING;


--
-- TOC entry 3474 (class 0 OID 33637)
-- Dependencies: 221
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3469 (class 0 OID 17735)
-- Dependencies: 216
-- Data for Name: worker_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3485 (class 0 OID 0)
-- Dependencies: 218
-- Name: hall_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hall_details_id_seq', 7, true);


--
-- TOC entry 3486 (class 0 OID 0)
-- Dependencies: 220
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.super_admin_super_admin_id_seq', 1, false);


--
-- TOC entry 3300 (class 2606 OID 33907)
-- Name: admin_accounts admin_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_email_key UNIQUE (email);


--
-- TOC entry 3302 (class 2606 OID 17734)
-- Name: admin_accounts admin_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3304 (class 2606 OID 17730)
-- Name: admin_accounts admin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3310 (class 2606 OID 17776)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 3312 (class 2606 OID 33630)
-- Name: settings hall_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT hall_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3314 (class 2606 OID 33909)
-- Name: settings settings_admin_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_admin_id_unique UNIQUE (admin_id);


--
-- TOC entry 3316 (class 2606 OID 33650)
-- Name: super_admin super_admin_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_email_key UNIQUE (email);


--
-- TOC entry 3318 (class 2606 OID 33648)
-- Name: super_admin super_admin_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 3320 (class 2606 OID 33646)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (super_admin_id);


--
-- TOC entry 3306 (class 2606 OID 17747)
-- Name: worker_accounts worker_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3308 (class 2606 OID 17745)
-- Name: worker_accounts worker_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_pkey PRIMARY KEY (worker_id);


--
-- TOC entry 3322 (class 2606 OID 17777)
-- Name: bookings bookings_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3323 (class 2606 OID 17782)
-- Name: bookings bookings_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_accounts(worker_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3324 (class 2606 OID 33631)
-- Name: settings fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON DELETE CASCADE;


--
-- TOC entry 3321 (class 2606 OID 17750)
-- Name: worker_accounts worker_accounts_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-15 18:12:16 IST

--
-- PostgreSQL database dump complete
--

\unrestrict 6QvifzeEI4dmh3hZ95YGSQIDikHVs1ftY5TiFdfEZW0j7FVH5BfPAacgOpgKkhn

