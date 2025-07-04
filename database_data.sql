--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, created_at, updated_at, email, is_active, permissions) FROM stdin;
8	superuser1	$2b$10$lq49l5MvWS1rW9gHSR3VB.XC.n/H5YI1KkRHf2eQ/ORcfCRZj1njq	superuser	2025-05-27 14:38:09.468024	2025-05-27 20:02:05.858	superuser1@example.com	t	{"superuser:all": true}
10	estudiante1	$2b$10$.RVBwcMc4JUpcvKCe64lTuaeNCxea3w630rT7yi/9Y5yxGjhh3UCq	estudiante	2025-05-27 14:38:09.81521	2025-05-27 20:02:06.287	estudiante1@example.com	t	{"document:read": true}
9	admin1	$2a$06$yI25DEuaEIonvOXmaAmMqe6IXEdG/wmjGEILeUBEZF8KhnhD1TjNG	admin	2025-05-27 14:38:09.662399	2025-05-27 20:02:06.093	admin1@example.com	t	{"user:read": true, "user:create": true, "user:update": true, "document:read": true, "admin:dashboard": true, "document:create": true, "document:update": true}
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, user_id, type, name, path, uploaded_at, status, rejection_reason, reviewed_by, reviewed_at) FROM stdin;
\.


--
-- Data for Name: enrollment_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.enrollment_stage_history (id, user_id, previous_stage, new_stage, changed_by, comments, validation_status, validation_notes, created_at) FROM stdin;
\.


--
-- Data for Name: installment_observations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installment_observations (id, user_id, observation, created_at) FROM stdin;
\.


--
-- Data for Name: installments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installments (id, user_id, installment_number, amount, support, status, due_date, paid_amount, payment_date, created_at) FROM stdin;
1	1	1	1500000	\N	pagada	2024-01-15 00:00:00	1500000	2024-01-15 10:30:00	2024-01-01 00:00:00
2	1	2	500000	\N	pagada	2024-02-15 00:00:00	500000	2024-02-15 14:20:00	2024-01-01 00:00:00
3	1	3	500000	\N	pendiente	2024-03-15 00:00:00	0	\N	2024-01-01 00:00:00
4	1	4	500000	\N	pendiente	2024-04-15 00:00:00	0	\N	2024-01-01 00:00:00
5	2	1	1200000	\N	pagada	2024-01-20 00:00:00	1200000	2024-01-20 09:15:00	2024-01-01 00:00:00
6	2	2	400000	\N	pendiente	2024-02-20 00:00:00	0	\N	2024-01-01 00:00:00
7	2	3	400000	\N	pendiente	2024-03-20 00:00:00	0	\N	2024-01-01 00:00:00
8	2	4	400000	\N	pendiente	2024-04-20 00:00:00	0	\N	2024-01-01 00:00:00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, body, link, is_read, type, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_id, payment_date, payment_method, amount, gift_received, documents_status) FROM stdin;
1	1	2024-01-15 10:30:00	tarjeta	1500000	f	Pago de matrícula
2	1	2024-02-15 14:20:00	efectivo	500000	f	Pago de cuota
3	2	2024-01-20 09:15:00	transferencia	1200000	f	Pago de matrícula
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profiles (id, user_id, full_name, email, document_type, document_number, birth_date, birth_place, personal_email, icfes_ac, phone, city, address, neighborhood, locality, social_stratum, blood_type, conflict_victim, marital_status, created_at, enrollment_stage) FROM stdin;
\.


--
-- Data for Name: universities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.universities (id, name, created_at) FROM stdin;
1	San Camilo	2025-05-14 16:06:51.956444
2	INCCA	2025-05-14 16:06:51.956444
3	FIT	2025-05-14 16:06:51.956444
4	Corporaci├â┬│n Universitaria Americana	2025-05-14 16:06:51.956444
5	Corporaci├â┬│n Universitaria CENDA	2025-05-14 16:06:51.956444
\.


--
-- Data for Name: programs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.programs (id, university_id, name, is_convention, created_at) FROM stdin;
1	1	Atenci├â┬│n a la Primera Infancia	t	2025-05-14 16:06:51.964961
2	1	Auxiliar Contable y Financiero	f	2025-05-14 16:06:51.964961
3	1	Recursos Humanos	f	2025-05-14 16:06:51.964961
4	1	Mantenimiento de Computadores	f	2025-05-14 16:06:51.964961
5	1	Animaci├â┬│n, Recreaci├â┬│n y Deportes	t	2025-05-14 16:06:51.964961
6	1	Trabajo Social y Comunitario	t	2025-05-14 16:06:51.964961
7	1	Sistemas Inform├â┬íticos y Software	t	2025-05-14 16:06:51.964961
8	1	Comercio Exterior	t	2025-05-14 16:06:51.964961
9	2	Administraci├â┬│n de Empresas	f	2025-05-14 16:06:51.976388
10	2	Biolog├â┬¡a	f	2025-05-14 16:06:51.976388
11	2	Cultura F├â┬¡sica y Deporte	f	2025-05-14 16:06:51.976388
12	2	Derecho	f	2025-05-14 16:06:51.976388
13	2	Ingenier├â┬¡a de Alimentos	f	2025-05-14 16:06:51.976388
14	2	Ingenier├â┬¡a de Sistemas	f	2025-05-14 16:06:51.976388
15	2	Ingenier├â┬¡a Electr├â┬│nica	f	2025-05-14 16:06:51.976388
16	2	Ingenier├â┬¡a Industrial	f	2025-05-14 16:06:51.976388
17	2	Ingenier├â┬¡a Mec├â┬ínica	f	2025-05-14 16:06:51.976388
18	2	Licenciatura en Educaci├â┬│n Infantil	f	2025-05-14 16:06:51.976388
19	2	Licenciatura en Espa├â┬▒ol e Ingl├â┬®s	f	2025-05-14 16:06:51.976388
20	3	T├â┬®cnico Laboral en Auxiliar Administrativo	f	2025-05-14 16:06:51.978817
21	3	T├â┬®cnico Laboral en Auxiliar Contable	f	2025-05-14 16:06:51.978817
22	3	T├â┬®cnico Laboral en Sistemas	f	2025-05-14 16:06:51.978817
23	3	T├â┬®cnico Laboral en Recursos Humanos	f	2025-05-14 16:06:51.978817
24	4	Derecho	f	2025-05-14 16:06:51.981149
25	4	Ingenier├â┬¡a de Sistemas	f	2025-05-14 16:06:51.981149
26	4	Psicolog├â┬¡a	f	2025-05-14 16:06:51.981149
27	4	Administraci├â┬│n de Empresas	f	2025-05-14 16:06:51.981149
28	5	Licenciatura en Educaci├â┬│n F├â┬¡sica	f	2025-05-14 16:06:51.984425
29	5	Licenciatura en Educaci├â┬│n Infantil	f	2025-05-14 16:06:51.984425
30	5	Terapia Ocupacional	f	2025-05-14 16:06:51.984425
\.


--
-- Data for Name: requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.requests (id, user_id, subject, message, status, response, created_at, updated_at, responded_at, responded_by) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, permissions, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- Data for Name: university_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.university_data (id, user_id, university_id, program_id, academic_period, study_duration, methodology, degree_title, subscription_type, application_method, severance_payment_used) FROM stdin;
\.


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: enrollment_stage_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.enrollment_stage_history_id_seq', 1, false);


--
-- Name: installment_observations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.installment_observations_id_seq', 1, false);


--
-- Name: installments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.installments_id_seq', 8, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 3, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profiles_id_seq', 3, true);


--
-- Name: programs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.programs_id_seq', 30, true);


--
-- Name: requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.requests_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: universities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.universities_id_seq', 5, true);


--
-- Name: university_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.university_data_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 10, true);


--
-- PostgreSQL database dump complete
--

