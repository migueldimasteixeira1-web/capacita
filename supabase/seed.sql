insert into roles (id, name)
values
  ('participante', 'Participante'),
  ('instrutor', 'Instrutor'),
  ('gestor', 'Gestor'),
  ('administrador', 'Administrador')
on conflict (id) do nothing;

with seeded_profiles as (
  insert into profiles (registration_number, cpf, full_name, email, role_id, secretariat)
  values
    ('2024001', '12345678900', 'Maria da Silva', 'maria.silva@prefeitura.gov', 'participante', 'SEMAD'),
    ('500100', '11122233344', 'Carlos Mendes', 'carlos.mendes@prefeitura.gov', 'instrutor', 'SME'),
    ('900200', '22233344455', 'Fernanda Costa', 'fernanda.costa@prefeitura.gov', 'gestor', 'SMS'),
    ('900100', '33344455566', 'João Martins', 'joao.martins@prefeitura.gov', 'administrador', 'SEGOV')
  on conflict (registration_number) do update
    set full_name = excluded.full_name
  returning id, registration_number
),
seeded_instructor as (
  insert into instructors (profile_id, full_name, cpf, email, specialty)
  select id, 'Carlos Mendes', '11122233344', 'carlos.mendes@prefeitura.gov', 'Informática aplicada'
  from seeded_profiles
  where registration_number = '500100'
  on conflict (cpf) do update
    set specialty = excluded.specialty
  returning id
),
seeded_courses as (
  insert into courses (
    title, description, category, modality, status, workload_hours, spots, enrollment_start, enrollment_end,
    minimum_attendance_percent, location, display_date, display_time_range, owner_secretariat
  )
  values
    ('Informática aplicada ao serviço público', 'Capacitação introdutória para servidores.', 'Tecnologia', 'presencial', 'inscricoes_abertas', 3, 40, now() - interval '5 days', now() + interval '30 days', 75, 'Centro de Capacitação Municipal', current_date + 15, '09:00 - 12:00', 'SME'),
    ('Direitos do consumidor — oficina aplicada', 'Atendimento institucional ao cidadão.', 'Cidadania', 'hibrido', 'em_execucao', 2, 100, now() - interval '30 days', now() - interval '5 days', 80, 'Auditório da Prefeitura', current_date + 5, '14:00 - 16:00', 'SEGOV'),
    ('Primeiros socorros no ambiente de trabalho', 'Protocolos básicos para equipes municipais.', 'Saúde', 'presencial', 'encerrado', 4, 25, now() - interval '90 days', now() - interval '60 days', 85, 'Unidade de Saúde Central', current_date - 15, '09:00 - 13:00', 'SMS'),
    ('Educação financeira para servidores', 'Planejamento financeiro pessoal.', 'Finanças', 'online', 'rascunho', 2, 50, now() + interval '10 days', now() + interval '40 days', 100, 'Plataforma interna', current_date + 40, '19:00 - 21:00', 'SEMAD')
  on conflict do nothing
  returning id, title
)
insert into instructor_assignments (course_id, instructor_id, assignment_status)
select c.id, i.id, 'ativa'
from seeded_courses c
cross join seeded_instructor i
where c.title in ('Informática aplicada ao serviço público', 'Direitos do consumidor — oficina aplicada')
on conflict (course_id, instructor_id) do nothing;
