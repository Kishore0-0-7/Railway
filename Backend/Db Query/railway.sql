--
-- PostgreSQL database dump
--

\restrict sWJis9vQ5OHgQRfF9Dw7OL84nx5AmVOowX8q9WnfkdjGT9oNz1MwnFOho2NHNy1

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-11-07 15:05:38 IST

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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

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
-- TOC entry 3476 (class 0 OID 0)
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
-- TOC entry 3477 (class 0 OID 0)
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
-- TOC entry 3288 (class 2604 OID 33640)
-- Name: super_admin super_admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin ALTER COLUMN super_admin_id SET DEFAULT nextval('public.super_admin_super_admin_id_seq'::regclass);


--
-- TOC entry 3464 (class 0 OID 17720)
-- Dependencies: 215
-- Data for Name: admin_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_accounts (admin_id, full_name, email, mobile_number, password_hash, role, created_at, updated_at) FROM stdin;
ADM001	Ratheesh	rrr@gmail.com	1237894560	$2b$10$6ja.lpAfNSKlWdX.Azwb3.s.uE4yktde5CrUc2VqfJE9CAnPNuOOu	Admin	2025-10-25 09:21:50.022888+00	2025-10-25 09:21:50.022888+00
ADM002	admin	admin@gmail.com	9876543210	$2b$10$.n6YCVZ.MHyfwtYFtmvpD.TrjpK5A2RgCiZOhmnd7XV80rl1vOjjW	Admin	2025-10-28 15:29:58.632355+00	2025-10-28 15:29:58.632355+00
\.


--
-- TOC entry 3466 (class 0 OID 17755)
-- Dependencies: 217
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, admin_id, worker_id, guest_name, phone_number, number_of_persons, booking_type, total_hours, booking_date, in_time, out_time, proof_type, proof_id, price_per_person, total_amount, paid_amount, balance_amount, payment_method, status, created_at, updated_at) FROM stdin;
0711202593615780861416	ADM002	WOR007	subaranjani sakthivel	9361578086	2	sleeper	2	2025-11-07	14:20:48.181658	00:00:00	aadhar	678204507669	100.00	400.00	200.00	200.00	cash	active	2025-11-07 09:14:37.885837+00	2025-11-07 09:14:37.885837+00
0711202578964513211445	ADM002	WOR014	Mohideen S	7896451321	10	sleeper	11	2025-11-07	14:45:35.789871	\N	aadhar	6354343413	100.00	11000.00	5500.00	5500.00	cash	active	2025-11-07 09:15:36.278094+00	2025-11-07 09:15:36.278094+00
0711202543146516541122	ADM002	WOR007	Mohid s	4314651654	4	sitting	10	2025-11-07	11:22:47.328991	00:00:00	aadhar	354445465465	50.00	2000.00	1000.00	1000.00	cash	active	2025-11-07 09:16:15.514395+00	2025-11-07 09:16:15.514395+00
0711202595665465881252	ADM002	WOR007	vimal k	9566546588	5	sitting	10	2025-11-07	12:52:25.72806	00:00:00	aadhar	148614645464	50.00	2500.00	1250.00	1250.00	cash	active	2025-11-07 09:16:15.517022+00	2025-11-07 09:16:15.517022+00
0711202589778879891447	ADM002	WOR007	Vimal P	8977887989	4	sleeper	6	2025-11-07	14:47:26.660595	\N	aadhar	121212121212	100.00	2400.00	1200.00	1200.00	cash	active	2025-11-07 09:17:26.924471+00	2025-11-07 09:17:26.924471+00
\.


--
-- TOC entry 3468 (class 0 OID 33613)
-- Dependencies: 219
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, admin_id, admin_name, hall_name, type1, type1_amount, type2, type2_amount, type3, type3_amount, type4, type4_amount, created_at, updated_at) FROM stdin;
1	ADM002	admin	AC Waiting Hall	Sitting	15.00	Sitting AC	25.00	Sleeper	40.00	Sleeper AC	50.00	2025-11-07 07:13:06.228568	2025-11-07 07:13:06.228568
\.


--
-- TOC entry 3470 (class 0 OID 33637)
-- Dependencies: 221
-- Data for Name: super_admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.super_admin (super_admin_id, super_admin_name, phone_number, email, password, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3465 (class 0 OID 17735)
-- Dependencies: 216
-- Data for Name: worker_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_accounts (worker_id, admin_id, full_name, mobile_number, joining_date, gender, user_name, password_hash, created_at, updated_at, worker_status) FROM stdin;
WOR015	ADM002	subaranjani	9361578086	2005-12-12	Female	suba	$2b$10$jMvp8CSZidZlWKIDKyWoe.5XRK1ZZGd.K.Gw8DmGV8IpHIAYXFpP2	2025-11-07 06:44:50.348135+00	2025-11-07 06:48:42.687959+00	active
WOR016	ADM002	suba	9092261384	2025-06-23	Female	ranjani	$2b$10$yyBB5sWLn7LQkwV5USsN7.oopku1oNuiL1n0GODMN08vvGWP.SE/S	2025-11-07 09:10:07.45501+00	2025-11-07 09:10:07.45501+00	active
WOR002	ADM002	Asha Nair	9876500009	2025-10-18	Female	asha	hash2	2025-11-02 14:51:35.951649+00	2025-11-04 05:52:24.341367+00	inactive
WOR006	ADM002	sampleworker	1234567890	2025-11-03	Female	admin@gmail.com	$2b$10$7PIE1ABOTsQRDzL6o58cxuOvVyar4Yp./r8DdYms7OHHXb9YiBuau	2025-11-03 05:33:49.896917+00	2025-11-04 05:52:45.412272+00	active
WOR004	ADM002	Divya Raj	9876500003	2025-10-24	Female	divya	hash4	2025-11-02 14:51:35.951649+00	2025-11-04 05:53:09.164113+00	active
WOR008	ADM002	bbbb	1234567000	2025-04-04	Male	bbbb	$2b$10$NVn8Z5QrtLOr1TwNQ.oo6eLfCy2COa7WraFpxjbt.kpgcTEoE82dW	2025-11-04 13:24:03.713058+00	2025-11-04 13:24:03.713058+00	active
WOR009	ADM002	T1	7728882899	2025-11-05	Male	abb	$2b$10$b/CL0rgut6Hnv8va7W9NuehWLGgTnbDq5UUdMIgk3A0inBBp8Q8W2	2025-11-05 04:02:38.469448+00	2025-11-05 04:02:38.469448+00	active
WOR010	ADM002	T2	6839902067	2025-11-05	Male	abbb	$2b$10$UJY0W70xPmnjljKYvFPT6uKf4ko4N6nNbcJqYkR/Sk6Q7ENl8Fhu2	2025-11-05 04:04:16.326932+00	2025-11-05 04:04:16.326932+00	active
WOR011	ADM002	Vimal	8778879833	2025-11-05	Male	Vimal12	$2b$10$xTM85dCR47gqJEbT2Xt8NuQcOw/MOoxRDmbekLg7IZ9o/v6MrHvqC	2025-11-05 04:05:51.196069+00	2025-11-05 04:05:51.196069+00	active
WOR003	ADM002	Manoj Singh	9876500002	2025-09-23	Male	manoj	hash3	2025-11-02 14:51:35.951649+00	2025-11-02 18:18:35.044172+00	active
WOR012	ADM002	Sabari 	8685866886	2025-11-05	Male	SabariWA01@Gmail.com	$2b$10$HecY4mwXcf4MC2NIKGllMu6.AzGMA83U3EpBtULED1bIw7LOKHGgu	2025-11-05 08:27:27.596576+00	2025-11-05 08:27:27.596576+00	active
WOR013	ADM002	Kishore	8673464347	2025-11-05	Male	kishore02@gmail.com	$2b$10$CPwOsjTsEBBaD1nPNVGX2uVIxxnQL0erzLNJeB23K2nsjit1tzePG	2025-11-05 08:29:17.868743+00	2025-11-05 08:29:17.868743+00	active
WOR007	ADM002	aaaa	0123456787	2025-11-03	Male	aaaa	$2b$10$sKQJUMYnqhN5IES8.W68P.zWAt6itRgr2Cpq0q5Y4ubo7POR2AI9y	2025-11-03 05:36:24.854263+00	2025-11-05 10:01:46.838024+00	active
WOR001	ADM002	wroker	9876543210	2025-11-01	Male	worker	$2b$10$vHEaQglC8dPxdPdTS6J4reLBt22TcGBhXlNIi90jClV/G12VDzBL6	2025-11-01 08:59:38.666883+00	2025-11-06 05:56:24.722866+00	inactive
WOR005	ADM002	Sathish Kumar	9876500004	2025-08-04	Male	sathish	hash5	2025-11-02 14:51:35.951649+00	2025-11-06 05:57:07.53032+00	active
WOR014	ADM002	Mohid	8832666531	2025-11-06	Male	mohid123	$2b$10$aNisM8fd8py/wOCKxoja0Oh33UebBCS312Utlciz1Xz9rxEcUjfo2	2025-11-06 07:11:57.094002+00	2025-11-07 05:47:27.100624+00	inactive
\.


--
-- TOC entry 3478 (class 0 OID 0)
-- Dependencies: 218
-- Name: hall_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hall_details_id_seq', 1, true);


--
-- TOC entry 3479 (class 0 OID 0)
-- Dependencies: 220
-- Name: super_admin_super_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.super_admin_super_admin_id_seq', 1, false);


--
-- TOC entry 3296 (class 2606 OID 17732)
-- Name: admin_accounts admin_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_email_key UNIQUE (email);


--
-- TOC entry 3298 (class 2606 OID 17734)
-- Name: admin_accounts admin_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3300 (class 2606 OID 17730)
-- Name: admin_accounts admin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3308 (class 2606 OID 17776)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 3310 (class 2606 OID 33630)
-- Name: settings hall_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT hall_details_pkey PRIMARY KEY (id);


--
-- TOC entry 3312 (class 2606 OID 33650)
-- Name: super_admin super_admin_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_email_key UNIQUE (email);


--
-- TOC entry 3314 (class 2606 OID 33648)
-- Name: super_admin super_admin_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_phone_number_key UNIQUE (phone_number);


--
-- TOC entry 3316 (class 2606 OID 33646)
-- Name: super_admin super_admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admin
    ADD CONSTRAINT super_admin_pkey PRIMARY KEY (super_admin_id);


--
-- TOC entry 3302 (class 2606 OID 17747)
-- Name: worker_accounts worker_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3304 (class 2606 OID 17745)
-- Name: worker_accounts worker_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_pkey PRIMARY KEY (worker_id);


--
-- TOC entry 3306 (class 2606 OID 17749)
-- Name: worker_accounts worker_accounts_user_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_user_name_key UNIQUE (user_name);


--
-- TOC entry 3318 (class 2606 OID 17777)
-- Name: bookings bookings_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3319 (class 2606 OID 17782)
-- Name: bookings bookings_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_accounts(worker_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3320 (class 2606 OID 33631)
-- Name: settings fk_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT fk_admin FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON DELETE CASCADE;


--
-- TOC entry 3317 (class 2606 OID 17750)
-- Name: worker_accounts worker_accounts_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-07 15:05:41 IST

--
-- PostgreSQL database dump complete
--

\unrestrict sWJis9vQ5OHgQRfF9Dw7OL84nx5AmVOowX8q9WnfkdjGT9oNz1MwnFOho2NHNy1

