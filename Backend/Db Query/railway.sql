--
-- PostgreSQL database dump
--

\restrict Ry5cVyXanhXyoXcmXUWsioycqQo4Scbfgd7r77X3KjgTCldmH3xduCtEqlb12VW

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

-- Started on 2025-11-03 10:07:01 IST

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
    out_time time without time zone NOT NULL,
    proof_type character varying(50) NOT NULL,
    proof_id character varying(50) NOT NULL,
    price_per_person numeric(10,2) NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0,
    balance_amount numeric(12,2) GENERATED ALWAYS AS ((total_amount - paid_amount)) STORED,
    payment_method character varying(50) DEFAULT 'cash'::character varying,
    booking_status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bookings_booking_date_check CHECK ((booking_date <= (CURRENT_DATE + '1 year'::interval))),
    CONSTRAINT bookings_booking_status_check CHECK (((booking_status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying])::text[]))),
    CONSTRAINT bookings_booking_type_check CHECK (((booking_type)::text = ANY ((ARRAY['sleeper'::character varying, 'sitting'::character varying])::text[]))),
    CONSTRAINT bookings_check CHECK (((paid_amount >= (0)::numeric) AND (paid_amount <= total_amount))),
    CONSTRAINT bookings_number_of_persons_check CHECK (((number_of_persons >= 1) AND (number_of_persons <= 50))),
    CONSTRAINT bookings_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'upi'::character varying])::text[]))),
    CONSTRAINT bookings_price_per_person_check CHECK ((price_per_person >= (0)::numeric)),
    CONSTRAINT bookings_proof_id_check CHECK ((length((proof_id)::text) >= 5)),
    CONSTRAINT bookings_proof_type_check CHECK (((proof_type)::text = ANY ((ARRAY['aadhar'::character varying, 'pan id'::character varying, 'pnr number'::character varying])::text[]))),
    CONSTRAINT bookings_total_amount_check CHECK ((total_amount >= (0)::numeric)),
    CONSTRAINT bookings_total_hours_check CHECK (((total_hours >= 1) AND (total_hours <= 24)))
);


ALTER TABLE public.bookings OWNER TO postgres;

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
-- TOC entry 3443 (class 0 OID 17720)
-- Dependencies: 215
-- Data for Name: admin_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_accounts (admin_id, full_name, email, mobile_number, password_hash, role, created_at, updated_at) FROM stdin;
ADM001	Ratheesh	rrr@gmail.com	1237894560	$2b$10$6ja.lpAfNSKlWdX.Azwb3.s.uE4yktde5CrUc2VqfJE9CAnPNuOOu	Admin	2025-10-25 09:21:50.022888+00	2025-10-25 09:21:50.022888+00
ADM002	admin	admin@gmail.com	9876543210	$2b$10$.n6YCVZ.MHyfwtYFtmvpD.TrjpK5A2RgCiZOhmnd7XV80rl1vOjjW	Admin	2025-10-28 15:29:58.632355+00	2025-10-28 15:29:58.632355+00
\.


--
-- TOC entry 3445 (class 0 OID 17755)
-- Dependencies: 217
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, admin_id, worker_id, guest_name, phone_number, number_of_persons, booking_type, total_hours, booking_date, in_time, out_time, proof_type, proof_id, price_per_person, total_amount, paid_amount, payment_method, booking_status, created_at, updated_at) FROM stdin;
BKG001	ADM002	WOR001	Arjun Kumar	9876512345	3	sleeper	6	2025-11-02	10:00:00	16:00:00	aadhar	123456789012	250.00	750.00	750.00	cash	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG002	ADM002	WOR001	Priya Sharma	9123456780	2	sitting	4	2025-11-02	08:00:00	12:00:00	pan id	BNZPS1234K	200.00	400.00	200.00	upi	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG003	ADM002	WOR001	Rahul Mehta	9812345678	5	sleeper	8	2025-11-03	18:00:00	02:00:00	aadhar	765432109876	300.00	1500.00	1500.00	card	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG004	ADM002	WOR001	Sneha Patel	9000011111	4	sitting	5	2025-11-04	09:00:00	14:00:00	pnr number	PNR12345	180.00	720.00	500.00	cash	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG005	ADM002	WOR001	Vikram Das	9898989898	1	sleeper	10	2025-11-05	22:00:00	08:00:00	aadhar	9999911111	400.00	400.00	400.00	upi	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG006	ADM002	WOR001	Riya Verma	9700012345	6	sleeper	7	2025-11-06	07:00:00	14:00:00	aadhar	1234509876	280.00	1680.00	1000.00	cash	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG007	ADM002	WOR001	Karan Gupta	9600023456	2	sitting	3	2025-11-07	09:00:00	12:00:00	pan id	AKTPG2345Q	150.00	300.00	300.00	upi	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG008	ADM002	WOR001	Meena Nair	9500034567	3	sleeper	6	2025-11-08	10:00:00	16:00:00	pnr number	PNR56789	250.00	750.00	500.00	card	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG009	ADM002	WOR001	Suresh Rao	9400045678	8	sleeper	9	2025-11-09	12:00:00	21:00:00	aadhar	567890123456	300.00	2400.00	2400.00	upi	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG010	ADM002	WOR001	Neha Jain	9300056789	2	sitting	4	2025-11-10	08:00:00	12:00:00	aadhar	11122334455	220.00	440.00	200.00	cash	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG011	ADM002	WOR001	Amit Tiwari	9200067890	4	sleeper	5	2025-11-11	09:00:00	14:00:00	pan id	DFGHT5678L	270.00	1080.00	1080.00	upi	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG012	ADM002	WOR001	Tina Joseph	9100078901	1	sitting	2	2025-11-12	11:00:00	13:00:00	aadhar	1234598765	150.00	150.00	150.00	cash	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG013	ADM002	WOR001	Deepak Yadav	9000089012	5	sleeper	8	2025-11-13	18:00:00	02:00:00	pnr number	PNR67890	310.00	1550.00	1200.00	card	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG014	ADM002	WOR001	Kavya Iyer	9897012345	3	sitting	6	2025-11-14	13:00:00	19:00:00	pan id	GHJKL1234P	200.00	600.00	600.00	upi	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG015	ADM002	WOR001	Rohit Sen	9788012345	2	sleeper	4	2025-11-15	08:00:00	12:00:00	aadhar	555666777888	280.00	560.00	400.00	cash	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG016	ADM002	WOR001	Lakshmi Menon	9678012345	6	sitting	10	2025-11-16	10:00:00	20:00:00	pnr number	PNR45678	190.00	1140.00	1140.00	card	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG017	ADM002	WOR001	Nitin Bhatia	9567012345	4	sleeper	9	2025-11-17	09:00:00	18:00:00	pan id	PQWER7890L	320.00	1280.00	800.00	upi	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG018	ADM002	WOR001	Shreya Ghosh	9456012345	3	sitting	5	2025-11-18	10:00:00	15:00:00	aadhar	333444555666	180.00	540.00	540.00	cash	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG019	ADM002	WOR001	Vivek Raj	9345012345	2	sleeper	12	2025-11-19	20:00:00	08:00:00	pnr number	PNR98765	350.00	700.00	700.00	card	completed	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG020	ADM002	WOR001	Ananya Bose	9234012345	5	sitting	6	2025-11-20	14:00:00	20:00:00	aadhar	222333444555	250.00	1250.00	800.00	upi	active	2025-11-02 09:34:16.873022+00	2025-11-02 09:34:16.873022+00
BKG021	ADM002	WOR001	Rohan Malhotra	9998887776	3	sleeper	8	2025-11-02	09:00:00	17:00:00	aadhar	1234555555	250.00	750.00	500.00	cash	active	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG022	ADM002	WOR001	Sita Iyer	8887776665	4	sitting	5	2025-11-03	10:00:00	15:00:00	pan id	ABCFG1234Q	180.00	720.00	720.00	upi	completed	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG023	ADM002	WOR002	Anil Kumar	7776665554	2	sleeper	6	2025-11-04	11:00:00	17:00:00	aadhar	4567812345	300.00	600.00	300.00	upi	active	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG024	ADM002	WOR002	Megha Singh	6665554443	5	sitting	8	2025-11-05	08:00:00	16:00:00	pnr number	PNR23456	220.00	1100.00	1100.00	card	completed	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG025	ADM002	WOR004	Rajeev Das	9556677889	3	sleeper	7	2025-11-06	12:00:00	19:00:00	aadhar	8887776665	280.00	840.00	400.00	cash	active	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG026	ADM002	WOR004	Neha Sood	9445566778	2	sitting	4	2025-11-07	09:00:00	13:00:00	pan id	LKJHG9876T	200.00	400.00	400.00	upi	completed	2025-11-02 14:51:46.703702+00	2025-11-02 14:51:46.703702+00
BKG027	ADM002	WOR003	Preeti Rao	9334455667	4	sleeper	9	2025-10-03	10:00:00	19:00:00	aadhar	9988776655	300.00	1200.00	1200.00	upi	completed	2025-11-02 14:53:04.053349+00	2025-11-02 14:53:04.053349+00
BKG028	ADM002	WOR003	Deepak Singh	9223344556	3	sitting	5	2025-10-05	08:00:00	13:00:00	pan id	DFGHT3456L	180.00	540.00	540.00	cash	completed	2025-11-02 14:53:04.053349+00	2025-11-02 14:53:04.053349+00
BKG029	ADM002	WOR005	Ananya R	9112233445	2	sleeper	6	2025-09-13	09:00:00	15:00:00	pnr number	PNR12333	250.00	500.00	500.00	card	completed	2025-11-02 14:53:04.053349+00	2025-11-02 14:53:04.053349+00
BKG030	ADM002	WOR005	Hari Mohan	9001122334	6	sitting	10	2025-09-18	10:00:00	20:00:00	aadhar	5554443332	190.00	1140.00	1140.00	cash	completed	2025-11-02 14:53:04.053349+00	2025-11-02 14:53:04.053349+00
\.


--
-- TOC entry 3444 (class 0 OID 17735)
-- Dependencies: 216
-- Data for Name: worker_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.worker_accounts (worker_id, admin_id, full_name, mobile_number, joining_date, gender, user_name, password_hash, created_at, updated_at, worker_status) FROM stdin;
WOR001	ADM002	wroker	9876543210	2025-11-01	Male	worker	$2b$10$vHEaQglC8dPxdPdTS6J4reLBt22TcGBhXlNIi90jClV/G12VDzBL6	2025-11-01 08:59:38.666883+00	2025-11-01 08:59:38.666883+00	active
WOR003	ADM002	Manoj Singh	9876500002	2025-09-23	Male	manoj	hash3	2025-11-02 14:51:35.951649+00	2025-11-02 18:18:35.044172+00	active
WOR005	ADM002	Sathish Kumar	9876500004	2025-08-04	Male	sathish	hash5	2025-11-02 14:51:35.951649+00	2025-11-03 04:08:44.972804+00	active
WOR004	ADM002	Divya Raj	9876500003	2025-10-28	Female	divya	hash4	2025-11-02 14:51:35.951649+00	2025-11-03 04:08:48.255651+00	inactive
WOR002	ADM002	Asha Nair	9876500001	2025-10-18	Female	asha	hash2	2025-11-02 14:51:35.951649+00	2025-11-03 04:08:36.268954+00	inactive
\.


--
-- TOC entry 3284 (class 2606 OID 17732)
-- Name: admin_accounts admin_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_email_key UNIQUE (email);


--
-- TOC entry 3286 (class 2606 OID 17734)
-- Name: admin_accounts admin_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3288 (class 2606 OID 17730)
-- Name: admin_accounts admin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 3296 (class 2606 OID 17776)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- TOC entry 3290 (class 2606 OID 17747)
-- Name: worker_accounts worker_accounts_mobile_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_mobile_number_key UNIQUE (mobile_number);


--
-- TOC entry 3292 (class 2606 OID 17745)
-- Name: worker_accounts worker_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_pkey PRIMARY KEY (worker_id);


--
-- TOC entry 3294 (class 2606 OID 17749)
-- Name: worker_accounts worker_accounts_user_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_user_name_key UNIQUE (user_name);


--
-- TOC entry 3298 (class 2606 OID 17777)
-- Name: bookings bookings_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3299 (class 2606 OID 17782)
-- Name: bookings bookings_worker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.worker_accounts(worker_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3297 (class 2606 OID 17750)
-- Name: worker_accounts worker_accounts_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_accounts
    ADD CONSTRAINT worker_accounts_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(admin_id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2025-11-03 10:07:08 IST

--
-- PostgreSQL database dump complete
--

\unrestrict Ry5cVyXanhXyoXcmXUWsioycqQo4Scbfgd7r77X3KjgTCldmH3xduCtEqlb12VW

