--
-- PostgreSQL database dump
--

\restrict zOpSdwEy7Xn4zDmHTmxCFs39sFCjKE2ydCpiQhh61ZOvR78ShsekzQ67MuO2WF4

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-26 11:18:48 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS railway;
--
-- TOC entry 3495 (class 1262 OID 17719)
-- Name: railway; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE railway WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';


ALTER DATABASE railway OWNER TO postgres;

\unrestrict zOpSdwEy7Xn4zDmHTmxCFs39sFCjKE2ydCpiQhh61ZOvR78ShsekzQ67MuO2WF4
\connect railway
\restrict zOpSdwEy7Xn4zDmHTmxCFs39sFCjKE2ydCpiQhh61ZOvR78ShsekzQ67MuO2WF4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
    payment_status character varying(50) DEFAULT 'Pending'::character varying,
    duration integer,
    amount integer,
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
-- TOC entry 227 (class 1259 OID 58567)
-- Name: printer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.printer (
    id integer NOT NULL,
    admin_id character varying(50) NOT NULL,
    heading1 character varying(100),
    heading2 character varying(100),
    info1 character varying(255),
    info2 character varying(255),
    note text,
    hall_name text,
    logo_url text
);


ALTER TABLE public.printer OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 58566)
-- Name: printer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.printer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.printer_id_seq OWNER TO postgres;

--
-- TOC entry 3496 (class 0 OID 0)
-- Dependencies: 226
-- Name: printer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.printer_id_seq OWNED BY public.printer.id;


--
-- TOC entry 221 (class 1259 OID 58513)
-- Name: setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setting (
    id integer NOT NULL,
    admin_id character varying(50) NOT NULL,
    type_1 character varying(50),
    type_1_amount integer,
    type_2 character varying(50),
    grace_amount integer,
    advance_payment_enabled boolean DEFAULT false,
    advanced_payment numeric(10,2),
    grace_amount_type2 integer
);


ALTER TABLE public.setting OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 58512)
-- Name: setting_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setting_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setting_id_seq OWNER TO postgres;

--
-- TOC entry 3497 (class 0 OID 0)
-- Dependencies: 220
-- Name: setting_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setting_id_seq OWNED BY public.setting.id;


--
-- TOC entry 223 (class 1259 OID 58547)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    admin_id character varying(50) NOT NULL,
    type_1 character varying(50),
    type_1_amount integer,
    type_2 character varying(50),
    grace_amount integer,
    advance_payment_enabled boolean DEFAULT false,
    advanced_payment numeric(10,2),
    grace_amount_type2 integer
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 58546)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- TOC entry 3498 (class 0 OID 0)
-- Dependencies: 222
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 219 (class 1259 OID 33637)
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
-- TOC entry 218 (class 1259 OID 33636)
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
-- TOC entry 3499 (class 0 OID 0)
-- Dependencies: 218
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.super_admin_super_admin_id_seq OWNED BY public.super_admin.super_admin_id;


--
-- TOC entry 225 (class 1259 OID 58555)
-- Name: type2_amount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.type2_amount (
    id integer NOT NULL,
    setting_id integer NOT NULL,
    min_duration integer NOT NULL,
    max_duration integer NOT NULL,
    amount integer NOT NULL
);


ALTER TABLE public.type2_amount OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 58554)
-- Name: type2_amount_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.type2_amount_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.type2_amount_id_seq OWNER TO postgres;

--
-- TOC entry 3500 (class 0 OID 0)
-- Dependencies: 224
-- Name: type2_amount_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.type2_amount_id_seq OWNED BY public.type2_amount.id;


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
-- TOC entry 3301 (class 2604 OID 58570)
-- Name: printer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer ALTER COLUMN id SET DEFAULT nextval('public.printer_id_seq'::regclass);


--
-- TOC entry 3296 (class 2604 OID 58516)
-- Name: setting id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setting ALTER COLUMN id SET DEFAULT nextval('public.setting_id_seq'::regclass);


--
-- TOC entry 3298 (class 2604 OID 58550)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 3293 (class 2604 OID 33640)
-- Name: super_admin super_admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin ALTER COLUMN super_admin_id SET DEFAULT nextval('public.super_admin_super_admin_id_seq'::regclass);


--
-- TOC entry 3300 (class 2604 OID 58558)
-- Name: type2_amount id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.type2_amount ALTER COLUMN id SET DEFAULT nextval('public.type2_amount_id_seq'::regclass);


--
-- TOC entry 3477 (class 0 OID 17720)
-- Dependencies: 215
-- Data for Name: admin_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.admin_accounts VALUES ('ADM001', 'erode', 'erode@gmail.com', '9865911972', '$2b$10$mWAMwTNhv1DSWxqOc60or.hpyjA1JM2gKAERYSAhmPjJjhl8zF/RK', 'Admin', '2025-11-15 12:39:11.063684+00', '2025-11-18 18:59:03.842995+00', 'Completed', 12, 2000);
INSERT INTO public.admin_accounts VALUES ('ADM002', 'Vanakam da Mapla', 'TheniPayaluga', '1100110011', '$2b$10$l/RxSCd.Gcy.4fA5uAU1X.uXu2x6chd9aubgQZP0uEFIOioocBMS2', 'Admin', '2025-11-18 19:06:35.581655+00', '2025-11-18 19:14:11.778142+00', 'Completed', 12, 2000);
INSERT INTO public.admin_accounts VALUES ('ADM003', 'artech', 'artech@gmail.com', '9361070035', '$2b$10$U5tp2gxuGuSWfelCtalgGulL3fBc1v9GZU7cLB0f4VrFMtETljNEi', 'Admin', '2025-11-24 04:09:32.905646+00', '2025-11-24 04:09:32.905646+00', 'Pending', NULL, NULL);


--
-- TOC entry 3479 (class 0 OID 17755)
-- Dependencies: 217
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.bookings VALUES ('2411202536645757460429', 'ADM003', 'WOR009', 'one', '3664575746', 2, 'sitting', 3, '2025-11-23', '04:29:47.169129', NULL, 'pnr number', '2312213213', 75.00, 150.00, 30.00, 120.00, 'cash', 'active', '2025-11-24 09:29:44.744956+00', '2025-11-24 09:29:44.744956+00');
INSERT INTO public.bookings VALUES ('2411202546546465461500', 'ADM003', 'WOR007', 'vimal adhasbfkja', '4654646546', 4, 'sleeper', 2, '2025-11-24', '15:00:24.529444', NULL, 'pnr number', '6465468465', 300.00, 1200.00, 0.00, 1200.00, 'cash', 'active', '2025-11-24 09:30:25.412603+00', '2025-11-24 09:30:25.412603+00');
INSERT INTO public.bookings VALUES ('2411202583298905981500', 'ADM003', 'WOR007', 'dhfksdhkjfsdhkshkjsfd efoewu', '8329890598', 33, 'sitting', 4, '2025-11-24', '15:00:50.725486', NULL, 'pnr number', '3636543257', 400.00, 13200.00, 0.00, 13200.00, 'cash', 'active', '2025-11-24 09:30:51.471597+00', '2025-11-24 09:30:51.471597+00');
INSERT INTO public.bookings VALUES ('2411202535467431211500', 'ADM003', 'WOR007', 'dlayskgfdkgfkd uiuhwfkjs', '3546743121', 3, 'sleeper', 3, '2025-11-24', '15:01:09.856316', NULL, 'pnr number', '4376846654', 450.00, 1350.00, 0.00, 1350.00, 'cash', 'active', '2025-11-24 09:31:10.60365+00', '2025-11-24 09:31:10.60365+00');
INSERT INTO public.bookings VALUES ('2411202523186372160438', 'ADM003', 'WOR009', 'three', '2318637216', 4, 'sitting', 1, '2025-11-23', '04:39:48.177495', NULL, 'aadhar', '123456789876', 25.00, 100.00, 20.00, 80.00, 'cash', 'active', '2025-11-24 09:39:50.287726+00', '2025-11-24 09:39:50.287726+00');
INSERT INTO public.bookings VALUES ('2411202596531232131933', 'ADM003', 'WOR010', 'oihklnlknlnl w', '9653123213', 5, 'sitting', 3, '2025-11-24', '19:33:25.331826', NULL, 'aadhar', '351312212121', 75.00, 375.00, 75.00, 300.00, 'cash', 'active', '2025-11-24 14:02:54.1475+00', '2025-11-24 14:02:54.1475+00');
INSERT INTO public.bookings VALUES ('2411202599999999991934', 'ADM003', 'WOR010', 'iiiiiii i', '9999999999', 9, 'sleeping', 9, '2025-11-24', '19:34:25.784004', NULL, 'aadhar', '999999999999', 900.00, 8100.00, 1620.00, 6480.00, 'cash', 'active', '2025-11-24 14:03:49.908855+00', '2025-11-24 14:03:49.908855+00');
INSERT INTO public.bookings VALUES ('2411202565465454561934', 'ADM003', 'WOR010', 'kkkkkkkkkkk k', '6546545456', 2, 'sitting', 2, '2025-11-24', '19:34:58.786744', NULL, 'pnr number', '54', 50.00, 100.00, 20.00, 80.00, 'cash', 'active', '2025-11-24 14:04:22.948949+00', '2025-11-24 14:04:22.948949+00');
INSERT INTO public.bookings VALUES ('2411202568699999991935', 'ADM003', 'WOR010', 'hhhhhhhhhhhhhhhhhhhh i', '6869999999', 1, 'sitting', 4, '2025-11-24', '19:36:04.204053', NULL, 'pnr number', '65466555555555', 100.00, 100.00, 20.00, 80.00, 'cash', 'active', '2025-11-24 14:05:28.460027+00', '2025-11-24 14:05:28.460027+00');
INSERT INTO public.bookings VALUES ('2411202512345678901032', 'ADM003', 'WOR009', 'Vimal P', '1234567890', 1, 'sitting', 1, '2025-11-24', '10:33:14.8509', NULL, 'aadhar', '123456789876', 100.00, 100.00, 0.00, 100.00, 'cash', 'active', '2025-11-24 05:03:16.885717+00', '2025-11-24 05:03:16.885717+00');
INSERT INTO public.bookings VALUES ('2411202588383487371936', 'ADM003', 'WOR010', 'mohid s', '8838348737', 1, 'sitting', 1, '2025-11-24', '19:36:52.534548', NULL, 'aadhar', '558405363808', 25.00, 25.00, 5.00, 20.00, 'cash', 'active', '2025-11-24 14:06:16.683647+00', '2025-11-24 14:06:16.683647+00');
INSERT INTO public.bookings VALUES ('2411202584653456462059', 'ADM003', 'WOR010', 'sdd a', '8465345646', 1, 'sitting', 2, '2025-11-24', '20:59:28.199183', NULL, 'aadhar', '534545324563', 50.00, 50.00, 10.00, 40.00, 'cash', 'active', '2025-11-24 15:28:52.581248+00', '2025-11-24 15:28:52.581248+00');
INSERT INTO public.bookings VALUES ('2411202545213467842100', 'ADM003', 'WOR010', 'fgbg l', '4521346784', 1, 'sleeping', 3, '2025-11-24', '21:00:16.03035', NULL, 'aadhar', '123131322222', 300.00, 300.00, 60.00, 240.00, 'cash', 'active', '2025-11-24 15:29:40.332502+00', '2025-11-24 15:29:40.332502+00');
INSERT INTO public.bookings VALUES ('2311202596596799781808', 'ADM001', 'WOR005', 'baby t', '9659679978', 2, 'sitting', 1, '2025-11-23', '18:08:38.240218', '18:09:28', 'pnr number', '2345986754', 25.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-23 12:38:38.82763+00', '2025-11-23 12:41:05.758372+00');
INSERT INTO public.bookings VALUES ('2411202598659119721133', 'ADM001', 'WOR003', 'rajendran', '9865911972', 1, 'sitting', 1, '2025-11-24', '11:34:20.810098', NULL, 'aadhar', '222222222', 25.00, 25.00, 0.00, 25.00, 'cash', 'active', '2025-11-24 06:04:21.945988+00', '2025-11-24 06:04:21.945988+00');
INSERT INTO public.bookings VALUES ('2311202509567432181750', 'ADM001', 'WOR005', 'kumar m', '0956743218', 2, 'sitting', 10, '2025-11-23', '17:51:15.532069', '17:52:04', 'aadhar', '1342576768', 250.00, 500.00, 0.00, 500.00, 'Cash', 'completed', '2025-11-23 12:21:16.134547+00', '2025-11-23 12:23:51.323817+00');
INSERT INTO public.bookings VALUES ('2311202598565431251821', 'ADM001', 'WOR005', 'kupusamy p', '9856543125', 2, 'sitting', 4, '2025-11-23', '18:22:57.776807', NULL, 'aadhar', '98127634', 100.00, 200.00, 0.00, 200.00, 'cash', 'active', '2025-11-23 12:53:03.068327+00', '2025-11-23 12:53:03.068327+00');
INSERT INTO public.bookings VALUES ('2411202534567897541151', 'ADM003', 'WOR009', 'gfhj ghj', '3456789754', 3, 'sitting', 1, '2025-11-24', '11:51:30.679394', NULL, 'aadhar', '121327832783', 100.00, 300.00, 0.00, 300.00, 'cash', 'active', '2025-11-24 06:21:36.578553+00', '2025-11-24 06:21:36.578553+00');
INSERT INTO public.bookings VALUES ('2411202523456789871428', 'ADM003', 'WOR009', 'Vimal P', '2345678987', 1, 'sitting', 1, '2025-11-24', '14:28:11.43359', NULL, 'aadhar', '234567890098', 100.00, 100.00, 0.00, 100.00, 'cash', 'active', '2025-11-24 08:58:13.415441+00', '2025-11-24 08:58:13.415441+00');
INSERT INTO public.bookings VALUES ('2411202512345432341430', 'ADM003', 'WOR009', 'Vimal P', '1234543234', 1, 'sitting', 1, '2025-11-24', '14:30:49.020396', NULL, 'aadhar', '345432346543', 100.00, 100.00, 0.00, 100.00, 'cash', 'active', '2025-11-24 09:00:55.495839+00', '2025-11-24 09:00:55.495839+00');
INSERT INTO public.bookings VALUES ('2411202534567898761037', 'ADM003', 'WOR009', 'Vimal P', '3456789876', 1, 'sitting', 1, '2025-11-24', '10:37:46.354883', NULL, 'aadhar', '234567890987', 100.00, 100.00, 0.00, 100.00, 'cash', 'active', '2025-11-24 05:07:52.10466+00', '2025-11-24 05:07:52.10466+00');
INSERT INTO public.bookings VALUES ('2411202568346646861432', 'ADM003', 'WOR007', 'dhahdgfsdbksd adhfkjsdh', '6834664686', 65, 'sitting', 1, '2025-11-24', '14:32:38.956593', NULL, 'aadhar', '09923456786', 100.00, 6500.00, 0.00, 6500.00, 'cash', 'active', '2025-11-24 09:02:39.747604+00', '2025-11-24 09:02:39.747604+00');
INSERT INTO public.bookings VALUES ('2411202528636453461433', 'ADM003', 'WOR007', 'duidsgds', '2863645346', 1, 'sitting', 1, '2025-11-24', '14:33:12.02604', NULL, 'aadhar', '676687363863', 100.00, 100.00, 0.00, 100.00, 'cash', 'active', '2025-11-24 09:03:12.865568+00', '2025-11-24 09:03:12.865568+00');
INSERT INTO public.bookings VALUES ('2411202567858323861433', 'ADM003', 'WOR007', 'Mosbjhdb', '6785832386', 3, 'sleeper', 3, '2025-11-24', '14:33:39.499868', NULL, 'aadhar', '897376766376', 450.00, 1350.00, 0.00, 1350.00, 'cash', 'active', '2025-11-24 09:03:40.420745+00', '2025-11-24 09:03:40.420745+00');
INSERT INTO public.bookings VALUES ('2411202546854643241501', 'ADM003', 'WOR007', 'vimal p', '4685464324', 5, 'sleeper', 3, '2025-11-24', '15:01:53.761359', NULL, 'aadhar', '987654567890', 450.00, 2250.00, 0.00, 2250.00, 'cash', 'active', '2025-11-24 09:31:55.507365+00', '2025-11-24 09:31:55.507365+00');
INSERT INTO public.bookings VALUES ('2211202570106935441809', 'ADM001', 'WOR003', 'radha', '7010693544', 1, 'sitting', 2, '2025-11-22', '18:10:23.014896', '18:14:24', 'pnr number', '241532', 50.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-22 12:40:28.490504+00', '2025-11-22 12:44:38.483853+00');
INSERT INTO public.bookings VALUES ('2211202598765432101432', 'ADM001', 'WOR003', 'sabari a', '9876543210', 4, 'sitting', 4, '2025-11-22', '14:32:28.770003', '14:35:38', 'pnr number', 'cgdfgfdg', 200.00, 800.00, 160.00, 640.00, 'Card', 'completed', '2025-11-22 09:02:36.452149+00', '2025-11-22 09:05:48.522268+00');
INSERT INTO public.bookings VALUES ('2211202598765412301437', 'ADM001', 'WOR003', 'jagan a', '9876541230', 2, 'sleeping', 3, '2025-11-22', '14:38:21.12793', '14:38:45', 'aadhar', '123644788', 300.00, 600.00, 120.00, 480.00, 'Cash', 'completed', '2025-11-22 09:08:21.888603+00', '2025-11-22 09:08:52.636157+00');
INSERT INTO public.bookings VALUES ('2211202598765432101447', 'ADM001', 'WOR003', 'jagan a', '9876543210', 2, 'sitting', 1, '2025-11-22', '14:47:25.956181', '14:48:45', 'pnr number', '45654687687', 25.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-22 09:17:26.687806+00', '2025-11-22 09:19:02.127237+00');
INSERT INTO public.bookings VALUES ('2411202548478948871502', 'ADM003', 'WOR007', 'adsad a', '4847894887', 3, 'sitting', 12, '2025-11-24', '15:03:10.153716', NULL, 'pnr number', '2324343432', 1200.00, 3600.00, 0.00, 3600.00, 'cash', 'active', '2025-11-24 09:33:10.995396+00', '2025-11-24 09:33:10.995396+00');
INSERT INTO public.bookings VALUES ('2411202509876543210436', 'ADM003', 'WOR009', 'two', '0987654321', 3, 'sitting', 1, '2025-11-23', '04:36:42.461947', NULL, 'aadhar', '123456789009', 25.00, 75.00, 15.00, 60.00, 'cash', 'active', '2025-11-24 09:36:39.919251+00', '2025-11-24 09:36:39.919251+00');
INSERT INTO public.bookings VALUES ('2211202570106935441803', 'ADM001', 'WOR003', 'varsha', '7010693544', 1, 'sitting', 1, '2025-11-22', '18:04:24.175447', '18:18:02', 'pnr number', '4475235813', 25.00, 25.00, 0.00, 25.00, 'Cash', 'completed', '2025-11-22 12:34:30.519096+00', '2025-11-22 12:48:23.147789+00');
INSERT INTO public.bookings VALUES ('2211202570106935441527', 'ADM001', 'WOR003', 'radha', '7010693544', 2, 'sitting', 1, '2025-11-22', '15:30:18.507033', '15:32:08', 'pnr number', '2548765214', 25.00, 50.00, 0.00, 50.00, 'Net Banking', 'completed', '2025-11-22 10:00:24.580568+00', '2025-11-22 10:04:35.889473+00');
INSERT INTO public.bookings VALUES ('2211202512345698731538', 'ADM001', 'WOR003', 'qwer e', '1234569873', 2, 'sitting', 1, '2025-11-22', '15:38:47.846373', '15:39:34', 'pnr number', '165261212621', 25.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-22 10:08:54.018984+00', '2025-11-22 10:10:06.468304+00');
INSERT INTO public.bookings VALUES ('2211202589964522131509', 'ADM001', 'WOR003', 'aatha', '8996452213', 4, 'sitting', 2, '2025-11-22', '15:13:50.667567', '15:41:00', 'pnr number', '18517158818', 50.00, 200.00, 0.00, 200.00, 'UPI', 'completed', '2025-11-22 09:43:56.384564+00', '2025-11-22 10:11:09.522344+00');
INSERT INTO public.bookings VALUES ('2211202576546465471507', 'ADM001', 'WOR003', 'naveen s', '7654646547', 1, 'sitting', 1, '2025-11-22', '15:07:00', '15:41:16', 'aadhaar', '667646765465', 75.00, 75.00, 0.00, 75.00, 'UPI', 'completed', '2025-11-22 09:37:45.507627+00', '2025-11-22 10:11:21.967167+00');
INSERT INTO public.bookings VALUES ('2211202579787897901334', 'ADM001', 'WOR003', 'naveen a', '7978789790', 2, 'sitting', 2, '2025-11-22', '13:34:00', '15:52:21', 'pnr number', '45654654', 100.00, 400.00, 40.00, 160.00, 'UPI', 'completed', '2025-11-22 08:04:22.410951+00', '2025-11-22 10:22:28.014277+00');
INSERT INTO public.bookings VALUES ('2211202598765432101320', 'ADM001', 'WOR003', 'sabari', '9876543210', 2, 'sitting', 2, '2025-11-22', '13:22:00', '15:52:57', 'pnr number', '789765463413', 50.00, 200.00, 20.00, 80.00, 'UPI', 'completed', '2025-11-22 07:52:55.437972+00', '2025-11-22 10:23:02.586995+00');
INSERT INTO public.bookings VALUES ('2211202597914825461606', 'ADM001', 'WOR003', 'murugasan', '9791482546', 1, 'sitting', 1, '2025-11-22', '16:06:49.680682', '16:08:40', 'pnr number', '5343574577357', 25.00, 25.00, 0.00, 25.00, 'Cash', 'completed', '2025-11-22 10:36:50.693175+00', '2025-11-22 10:39:03.132097+00');
INSERT INTO public.bookings VALUES ('2211202598785552771603', 'ADM001', 'WOR003', 'rrytukt thfjg', '9878555277', 2, 'sitting', 1, '2025-11-22', '16:04:40.155388', '16:09:28', 'pnr number', '3213', 25.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-22 10:34:46.010165+00', '2025-11-22 10:40:15.897192+00');
INSERT INTO public.bookings VALUES ('2211202570106935441800', 'ADM001', 'WOR003', 'varsha', '7010693544', 1, 'sitting', 1, '2025-11-22', '18:20:00', '18:47:00', 'pnr number', '4575283', 25.00, 25.00, 0.00, 25.00, 'cash', 'completed', '2025-11-22 12:50:46.196342+00', '2025-11-22 13:17:08.605849+00');
INSERT INTO public.bookings VALUES ('2411202536274632781546', 'ADM003', 'WOR008', 'Sabari se', '3627463278', 2, 'sleeper', 2, '2025-11-24', '15:47:24.483181', NULL, 'aadhar', '976876786786', 200.00, 400.00, 80.00, 320.00, 'cash', 'active', '2025-11-24 10:17:25.357893+00', '2025-11-24 10:17:25.357893+00');
INSERT INTO public.bookings VALUES ('2311202598765432111340', 'ADM001', 'WOR005', 'mohid S', '9876543211', 2, 'sitting', 3, '2025-11-23', '13:41:09.746394', '13:42:38', 'pnr number', '7865875757858585585858585', 75.00, 150.00, 0.00, 150.00, 'UPI', 'completed', '2025-11-23 08:11:15.450228+00', '2025-11-23 08:13:42.984925+00');
INSERT INTO public.bookings VALUES ('2411202587878787872043', 'ADM003', 'WOR009', 'Vimal P', '8787878787', 1, 'sitting', 1, '2025-11-24', '20:43:33.321721', NULL, 'aadhar', '141414141414', 25.00, 25.00, 5.00, 20.00, 'cash', 'active', '2025-11-24 15:13:38.47426+00', '2025-11-24 15:13:38.47426+00');
INSERT INTO public.bookings VALUES ('2311202596875275751356', 'ADM001', 'WOR005', 'balu n', '9687527575', 9, 'sitting', 11, '2025-11-23', '13:56:15.309745', '14:00:11', 'pnr number', '44569872', 275.00, 2475.00, 0.00, 2475.00, 'Cash', 'completed', '2025-11-23 08:26:23.141044+00', '2025-11-23 08:34:25.980251+00');
INSERT INTO public.bookings VALUES ('2311202598422738481416', 'ADM001', 'WOR005', 'kuru g', '9842273848', 2, 'sitting', 1, '2025-11-23', '14:19:16.160564', '14:21:57', 'pnr number', '98753214', 25.00, 50.00, 0.00, 50.00, 'Cash', 'completed', '2025-11-23 08:49:23.771804+00', '2025-11-23 08:52:38.042602+00');
INSERT INTO public.bookings VALUES ('2311202565874594651515', 'ADM001', 'WOR005', 'laxme b', '6587459465', 2, 'sitting', 3, '2025-11-23', '15:22:06.445567', NULL, 'pnr number', '215469875', 75.00, 142.00, 0.00, 142.00, 'cash', 'active', '2025-11-23 09:52:16.102504+00', '2025-11-23 09:52:16.102504+00');
INSERT INTO public.bookings VALUES ('2311202598422748241538', 'ADM001', 'WOR005', 'raja g', '9842274824', 2, 'sitting', 9, '2025-11-23', '15:40:45.808934', NULL, 'aadhar', '3216987458', 225.00, 450.00, 0.00, 450.00, 'cash', 'active', '2025-11-23 10:10:53.919909+00', '2025-11-23 10:10:53.919909+00');
INSERT INTO public.bookings VALUES ('2311202597150075021546', 'ADM001', 'WOR005', 'nethya d', '9715007502', 3, 'sitting', 7, '2025-11-23', '15:48:08.728491', NULL, 'pnr number', '658321987', 175.00, 525.00, 0.00, 525.00, 'cash', 'active', '2025-11-23 10:18:24.359143+00', '2025-11-23 10:18:24.359143+00');
INSERT INTO public.bookings VALUES ('2411202589898989892044', 'ADM003', 'WOR009', 'Vimal P', '8989898989', 1, 'sitting', 1, '2025-11-24', '20:44:10.00569', NULL, 'aadhar', '121212121212', 25.00, 25.00, 5.00, 20.00, 'cash', 'active', '2025-11-24 15:14:09.633447+00', '2025-11-24 15:14:09.633447+00');
INSERT INTO public.bookings VALUES ('2411202587878787872046', 'ADM003', 'WOR009', 'Nandhu P', '8787878787', 1, 'sitting', 2, '2025-11-24', '20:47:59.729185', NULL, 'aadhar', '121211212121', 50.00, 50.00, 10.00, 40.00, 'cash', 'active', '2025-11-24 15:17:59.738532+00', '2025-11-24 15:17:59.738532+00');
INSERT INTO public.bookings VALUES ('2411202551324534532100', 'ADM003', 'WOR010', 'fcgcvcvcvcv k', '5132453453', 1, 'sitting', 3, '2025-11-24', '21:00:54.933512', NULL, 'aadhar', '53535353', 75.00, 75.00, 15.00, 60.00, 'cash', 'active', '2025-11-24 15:30:19.196354+00', '2025-11-24 15:30:19.196354+00');
INSERT INTO public.bookings VALUES ('2311202598675764321851', 'ADM001', 'WOR005', 'mugmathualli d', '9867576432', 3, 'sitting', 1, '2025-11-23', '18:52:45.369043', NULL, 'aadhar', '987867543', 25.00, 75.00, 0.00, 75.00, 'cash', 'active', '2025-11-23 13:22:50.96868+00', '2025-11-23 13:22:50.96868+00');
INSERT INTO public.bookings VALUES ('2411202598765432110957', 'ADM003', 'WOR007', 'naveenkanth s', '9876543211', 2, 'sitting', 1, '2025-11-24', '09:58:40.753341', NULL, 'pan id', '7464875645645654', 100.00, 200.00, 0.00, 200.00, 'cash', 'active', '2025-11-24 04:28:45.098362+00', '2025-11-24 04:28:45.098362+00');
INSERT INTO public.bookings VALUES ('2411202529735987491445', 'ADM003', 'WOR007', 'SABARI', '2973598749', 343, 'sitting', 1, '2025-11-24', '14:45:55.498353', NULL, 'aadhar', '34729574985', 100.00, 34300.00, 0.00, 34300.00, 'cash', 'active', '2025-11-24 09:15:56.372101+00', '2025-11-24 09:15:56.372101+00');
INSERT INTO public.bookings VALUES ('2411202512321313221502', 'ADM003', 'WOR007', 'fithima', '1232131322', 2, 'sitting', 5, '2025-11-24', '15:02:30.31684', NULL, 'pnr number', '3454534534', 500.00, 1000.00, 0.00, 1000.00, 'cash', 'active', '2025-11-24 09:32:31.1231+00', '2025-11-24 09:32:31.1231+00');
INSERT INTO public.bookings VALUES ('2411202578787878781139', 'ADM003', 'WOR009', 'suro juor', '7878787878', 5, 'sleeper', 1, '2025-11-24', '11:40:12.197498', '11:48:30', 'aadhar', '098764321234', 150.00, 750.00, 0.00, 750.00, 'Cash', 'completed', '2025-11-24 06:10:14.138589+00', '2025-11-24 06:18:43.981651+00');
INSERT INTO public.bookings VALUES ('2411202543432432431503', 'ADM003', 'WOR007', 'ginsnsnss q', '4343243243', 2, 'sitting', 4, '2025-11-24', '15:03:31.686898', NULL, 'pan id', 'NCLKK3432K', 400.00, 800.00, 0.00, 800.00, 'cash', 'active', '2025-11-24 09:33:32.548477+00', '2025-11-24 09:33:32.548477+00');
INSERT INTO public.bookings VALUES ('2411202522324324561503', 'ADM003', 'WOR007', 'hdafhgfh', '2232432456', 22, 'sitting', 2, '2025-11-24', '15:04:01.249018', NULL, 'pnr number', '3243243243', 200.00, 4400.00, 0.00, 4400.00, 'cash', 'active', '2025-11-24 09:34:02.010919+00', '2025-11-24 09:34:02.010919+00');
INSERT INTO public.bookings VALUES ('2411202545454353661504', 'ADM003', 'WOR007', 'fgergetttedfg s', '4545435366', 3, 'sleeper', 2, '2025-11-24', '15:04:30.053543', NULL, 'pnr number', '3456756432', 300.00, 900.00, 0.00, 900.00, 'cash', 'active', '2025-11-24 09:34:30.895095+00', '2025-11-24 09:34:30.895095+00');
INSERT INTO public.bookings VALUES ('2311202598422756981553', 'ADM001', 'WOR005', 'anpu nr', '9842275698', 5, 'sitting', 2, '2025-11-23', '15:54:02.629927', NULL, 'aadhar', '369852654', 50.00, 250.00, 0.00, 250.00, 'cash', 'active', '2025-11-23 10:24:05.538236+00', '2025-11-23 10:24:05.538236+00');
INSERT INTO public.bookings VALUES ('2411202599999999991928', 'ADM003', 'WOR010', 'sabari sekaran', '9999999999', 1, 'sleeping', 2, '2025-11-24', '19:29:16.951824', NULL, 'pnr number', '9877777777777777777777777777777', 200.00, 200.00, 40.00, 160.00, 'cash', 'active', '2025-11-24 13:58:41.127227+00', '2025-11-24 13:58:41.127227+00');
INSERT INTO public.bookings VALUES ('2311202599946575551657', 'ADM001', 'WOR005', 'kannan d', '9994657555', 4, 'sitting', 2, '2025-11-23', '16:57:38.945961', '17:43:15', 'aadhar', '658321459', 50.00, 200.00, 0.00, 200.00, 'Cash', 'completed', '2025-11-23 11:27:39.438307+00', '2025-11-23 12:13:58.512106+00');
INSERT INTO public.bookings VALUES ('2311202588452133331641', 'ADM001', 'WOR005', 'nathan k', '8845213333', 1, 'sitting', 1, '2025-11-23', '16:43:21.95762', '17:44:42', 'aadhar', '987645321', 25.00, 25.00, 0.00, 25.00, 'Cash', 'completed', '2025-11-23 11:13:22.707523+00', '2025-11-23 12:15:08.249277+00');
INSERT INTO public.bookings VALUES ('2411202598777777771929', 'ADM003', 'WOR010', 'asdddd wdqwa', '9877777777', 3, 'sleeping', 2, '2025-11-24', '19:30:07.09322', NULL, 'pnr number', '9888888888888888888888', 200.00, 600.00, 120.00, 480.00, 'cash', 'active', '2025-11-24 13:59:31.308153+00', '2025-11-24 13:59:31.308153+00');
INSERT INTO public.bookings VALUES ('2411202523894398241153', 'ADM003', 'WOR009', 'sdghsd sdfhjksfdj', '2389439824', 2, 'sitting', 3, '2025-11-24', '11:53:36.876827', NULL, 'pnr number', '1221334343', 300.00, 600.00, 0.00, 600.00, 'cash', 'active', '2025-11-24 06:23:37.868317+00', '2025-11-24 06:23:37.868317+00');
INSERT INTO public.bookings VALUES ('2411202589797465131930', 'ADM003', 'WOR010', 'oihdnsklznalsks s', '8979746513', 2, 'sleeping', 3, '2025-11-24', '19:30:55.832686', NULL, 'aadhar', '613213213122', 300.00, 600.00, 120.00, 480.00, 'cash', 'active', '2025-11-24 14:00:20.354417+00', '2025-11-24 14:00:20.354417+00');
INSERT INTO public.bookings VALUES ('2311202594448740102123', 'ADM001', 'WOR005', 'kamaraja p', '9444874010', 1, 'sitting', 1, '2025-11-23', '21:24:27.032417', '21:25:18', 'aadhar', '9786765432', 25.00, 25.00, 0.00, 25.00, 'Cash', 'completed', '2025-11-23 15:54:27.939662+00', '2025-11-23 15:58:02.58706+00');
INSERT INTO public.bookings VALUES ('2411202565465465461931', 'ADM003', 'WOR010', 'giri n', '6546546546', 5, 'sitting', 6, '2025-11-24', '19:31:55.094122', NULL, 'pnr number', '946513132132132131233', 150.00, 750.00, 150.00, 600.00, 'cash', 'active', '2025-11-24 14:01:19.316282+00', '2025-11-24 14:01:19.316282+00');
INSERT INTO public.bookings VALUES ('2411202596165321321932', 'ADM003', 'WOR010', 'suba q', '9616532132', 1, 'sleeping', 3, '2025-11-24', '19:32:49.9813', NULL, 'pnr number', '56546544444444444444444', 300.00, 300.00, 60.00, 240.00, 'cash', 'active', '2025-11-24 14:02:14.202618+00', '2025-11-24 14:02:14.202618+00');
INSERT INTO public.bookings VALUES ('2411202553535353532051', 'ADM003', 'WOR009', 'Vimal P', '5353535353', 1, 'sitting', 1, '2025-11-24', '20:51:12.168813', NULL, 'aadhar', '727272727227', 25.00, 25.00, 5.00, 20.00, 'cash', 'active', '2025-11-24 15:21:16.929287+00', '2025-11-24 15:21:16.929287+00');
INSERT INTO public.bookings VALUES ('2411202545678765452055', 'ADM003', 'WOR009', 'Vimal P', '4567876545', 1, 'sitting', 1, '2025-11-24', '20:55:30.512563', '21:55:00', 'aadhar', '345678765450', 25.00, 25.00, 5.00, 20.00, 'Cash', 'completed', '2025-11-24 15:25:30.642689+00', '2025-11-24 16:25:12.475861+00');
INSERT INTO public.bookings VALUES ('2511202593447438871001', 'ADM003', 'WOR009', 'Mohit r', '9344743887', 4, 'sleeping', 4, '2025-11-25', '10:02:36.042004', NULL, 'pan id', 'DAHGH9837S', 400.00, 1600.00, 320.00, 1280.00, 'cash', 'active', '2025-11-25 04:32:41.465295+00', '2025-11-25 04:32:41.465295+00');
INSERT INTO public.bookings VALUES ('2311202598422748241730', 'ADM001', 'WOR005', 'rala f', '9842274824', 2, 'sitting', 3, '2025-11-23', '17:31:16.352815', '17:32:35', 'aadhar', '658951574', 75.00, 150.00, 0.00, 150.00, 'UPI', 'completed', '2025-11-23 12:01:17.019326+00', '2025-11-23 12:02:57.726112+00');
INSERT INTO public.bookings VALUES ('2511202587545206551132', 'ADM003', 'WOR010', 'mohammed d', '8754520655', 4, 'sitting', 1, '2025-11-25', '11:33:12.860642', NULL, 'aadhar', '635541651211', 25.00, 100.00, 20.00, 80.00, 'cash', 'active', '2025-11-25 06:03:13.169902+00', '2025-11-25 06:03:13.169902+00');


--
-- TOC entry 3489 (class 0 OID 58567)
-- Dependencies: 227
-- Data for Name: printer; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.printer VALUES (8, 'ADM003', 'Railway', 'Station', 'Platform 1', 'Gate 2', 'Artecchnology', 'Testing', NULL);


--
-- TOC entry 3483 (class 0 OID 58513)
-- Dependencies: 221
-- Data for Name: setting; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3485 (class 0 OID 58547)
-- Dependencies: 223
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.settings VALUES (8, 'ADM003', 'Sitting', 50, 'Sleeping', 50, true, 20.00, 20);


--
-- TOC entry 3481 (class 0 OID 33637)
-- Dependencies: 219
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3487 (class 0 OID 58555)
-- Dependencies: 225
-- Data for Name: type2_amount; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.type2_amount VALUES (13, 8, 1, 3, 80);
INSERT INTO public.type2_amount VALUES (14, 8, 1, 6, 120);
INSERT INTO public.type2_amount VALUES (15, 8, 1, 12, 180);
INSERT INTO public.type2_amount VALUES (16, 8, 1, 24, 250);


--
-- TOC entry 3478 (class 0 OID 17735)
-- Dependencies: 216
-- Data for Name: worker_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.worker_accounts VALUES ('WOR009', 'ADM003', 'test4', '2323232323', '2025-11-24', 'Male', 'test4', '$2b$10$1juRMV2lz9noU1hOTDO7DeFNZHTU8zw9S4EOhdxFKXLH/QLHQxMCi', '2025-11-24 04:33:08.853854+00', '2025-11-24 14:59:28.159147+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR011', 'ADM001', 'Knm', '8760497994', '2025-11-25', 'Male', 'Knm', '$2b$10$3AkLDhHTYeBOHjfDSKhGJuyl7pOqNt03jCBdOutKn504FUpWBFxPe', '2025-11-25 04:29:09.837427+00', '2025-11-25 04:29:09.837427+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR003', 'ADM001', 'radha', '7010693544', '2025-11-22', 'Female', 'radha', '$2b$10$jW1SzRaeTX53LCAdd3NB0.gYWQ4XfAfXX6vV7zjitkqrLM0eZt/ti', '2025-11-22 07:22:06.159679+00', '2025-11-22 09:29:35.228446+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR004', 'ADM001', 'radha2', '1234567890', '2025-11-22', 'Female', 'radha2', '$2b$10$hXiq5gPpGC4RGN4OKvlSX.99YISy52HcnLePh0kbURwVUyB.y9tRW', '2025-11-22 15:35:26.222069+00', '2025-11-22 15:35:26.222069+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR005', 'ADM001', 'balan', '9976693404', '2025-11-23', 'Male', 'balan', '$2b$10$l8NtMVsyGzxk1.46NJWsP.voQn5l.Tq5rIk06Ol/OsU14sSqsylIu', '2025-11-23 08:00:48.376005+00', '2025-11-23 08:00:48.376005+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR006', 'ADM001', 'test', '9876543210', '2025-11-24', 'Male', 'test', '$2b$10$caI9pGD1z0ZFr9XTCvil/O.9IAvvDkvedRMWm4xXYVo67fr8omE5K', '2025-11-24 04:07:24.544424+00', '2025-11-24 04:07:24.544424+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR007', 'ADM003', 'test', '8975641300', '2025-11-24', 'Male', 'test1', '$2b$10$FW5DQcM3sO1it9zvqrNQ4O4H7agGVDshUUi5SZybMCd0Ip4rFRg.O', '2025-11-24 04:12:21.819778+00', '2025-11-24 04:17:29.238879+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR008', 'ADM003', 'Test2', '1234567898', '2025-11-24', 'Male', 'Test2', '$2b$10$yH6Vkzriu.77mcahgHePNOJpQGjSWtIBHVJmJe2n/PBNmPIMrF6Ze', '2025-11-24 04:18:34.570622+00', '2025-11-24 10:02:59.32244+00', 'active');
INSERT INTO public.worker_accounts VALUES ('WOR010', 'ADM003', 'mohid', '9879879879', '2025-11-24', 'Male', 'mohid', '$2b$10$08FjB8XKLajIBNnzgzgNTuwiTfgg8PMB.gibjzq7mubrxi9cFUFgC', '2025-11-24 13:57:29.114761+00', '2025-11-24 13:57:29.114761+00', 'active');


--
-- TOC entry 3501 (class 0 OID 0)
-- Dependencies: 226
-- Name: printer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.printer_id_seq', 8, true);


--
-- TOC entry 3502 (class 0 OID 0)
-- Dependencies: 220
-- Name: setting_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.setting_id_seq', 1, false);


--
-- TOC entry 3503 (class 0 OID 0)
-- Dependencies: 222
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 8, true);


--
-- TOC entry 3504 (class 0 OID 0)
-- Dependencies: 218
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.super_admin_super_admin_id_seq', 1, false);


--
-- TOC entry 3505 (class 0 OID 0)
-- Dependencies: 224
-- Name: type2_amount_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.type2_amount_id_seq', 16, true);


--
-- TOC entry 3307 (class 2606 OID 33907)
-- Name: admin_accounts admin_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_email_key UNIQUE (email);


--
-- TOC entry 3309 (class 2606 OID 17734)
-- Name: admin_accounts admin_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3311 (class 2606 OID 17730)
-- Name: admin_accounts admin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3315 (class 2606 OID 17776)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 3329 (class 2606 OID 58574)
-- Name: printer printer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printer
    ADD CONSTRAINT printer_pkey PRIMARY KEY (id);


--
-- TOC entry 3323 (class 2606 OID 58519)
-- Name: setting setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT setting_pkey PRIMARY KEY (id);


--
-- TOC entry 3325 (class 2606 OID 58553)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 33650)
-- Name: super_admin super_admin_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_email_key UNIQUE (email);


--
-- TOC entry 3319 (class 2606 OID 33648)
-- Name: super_admin super_admin_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 3321 (class 2606 OID 33646)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (super_admin_id);


--
-- TOC entry 3327 (class 2606 OID 58560)
-- Name: type2_amount type2_amount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.type2_amount
    ADD CONSTRAINT type2_amount_pkey PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 17745)
-- Name: worker_accounts worker_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_pkey PRIMARY KEY (worker_id);


--
-- TOC entry 3331 (class 2606 OID 17777)
-- Name: bookings bookings_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3332 (class 2606 OID 17782)
-- Name: bookings bookings_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_accounts(worker_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3333 (class 2606 OID 58561)
-- Name: type2_amount type2_amount_setting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.type2_amount
    ADD CONSTRAINT type2_amount_setting_id_fkey FOREIGN KEY (setting_id) REFERENCES public.settings(id) ON DELETE CASCADE;


--
-- TOC entry 3330 (class 2606 OID 17750)
-- Name: worker_accounts worker_accounts_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-26 11:19:07 IST

--
-- PostgreSQL database dump complete
--

\unrestrict zOpSdwEy7Xn4zDmHTmxCFs39sFCjKE2ydCpiQhh61ZOvR78ShsekzQ67MuO2WF4

