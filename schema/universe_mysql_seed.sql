USE universe_core;

INSERT INTO campus (campus_id, campus_name, location) VALUES
('camp_north', 'North Campus', 'Bhubaneswar, Odisha'),
('camp_design', 'Design Annex', 'Cuttack, Odisha'),
('camp_research', 'Research Yard', 'Rourkela, Odisha')
ON DUPLICATE KEY UPDATE
    campus_name = VALUES(campus_name),
    location = VALUES(location);

INSERT INTO admin (admin_id, campus_id, name, email) VALUES
('adm_001', 'camp_north', 'Rhea Kapoor', 'rhea.kapoor@universe.edu'),
('adm_002', 'camp_design', 'Neel Banerjee', 'neel.banerjee@universe.edu'),
('adm_003', 'camp_research', 'Vani Sharma', 'vani.sharma@universe.edu')
ON DUPLICATE KEY UPDATE
    campus_id = VALUES(campus_id),
    name = VALUES(name),
    email = VALUES(email);

INSERT INTO community (community_id, campus_id, name, description) VALUES
('com_001', 'camp_north', 'Systems Guild', 'Backend builds, distributed systems labs, and infra review nights.'),
('com_002', 'camp_design', 'Visual Lab', 'Product narratives, interface critiques, and brand experiments.'),
('com_003', 'camp_research', 'Data Commons', 'Research notes, experiments, and model benchmarking sessions.'),
('com_004', 'camp_north', 'Launch Circle', 'Student startup operators sharing playbooks, decks, and feedback.')
ON DUPLICATE KEY UPDATE
    campus_id = VALUES(campus_id),
    name = VALUES(name),
    description = VALUES(description);

INSERT INTO student (
    student_id,
    campus_id,
    name,
    email,
    password_hash,
    department,
    batch,
    instagram,
    github,
    linkedin
) VALUES
('stu_001', 'camp_north', 'Aarav Sen', 'aarav@universe.edu', '', 'Computer Science', 2026, 'https://instagram.com/aarav.codes', 'https://github.com/aaravsen', 'https://linkedin.com/in/aaravsen'),
('stu_002', 'camp_north', 'Mira Dutta', 'mira@universe.edu', '', 'Electronics', 2025, 'https://instagram.com/mira.builds', 'https://github.com/miradutta', 'https://linkedin.com/in/miradutta'),
('stu_003', 'camp_design', 'Kabir Ray', 'kabir@universe.edu', '', 'Design', 2027, 'https://instagram.com/kabirframes', 'https://github.com/kabirray', 'https://linkedin.com/in/kabirray'),
('stu_004', 'camp_research', 'Tara Bose', 'tara@universe.edu', '', 'Data Science', 2026, 'https://instagram.com/tarabose.ai', 'https://github.com/tarabose', 'https://linkedin.com/in/tarabose'),
('stu_005', 'camp_design', 'Ishaan Malik', 'ishaan@universe.edu', '', 'Product', 2025, 'https://instagram.com/ishaan.makes', 'https://github.com/ishaanmalik', 'https://linkedin.com/in/ishaanmalik')
ON DUPLICATE KEY UPDATE
    campus_id = VALUES(campus_id),
    name = VALUES(name),
    email = VALUES(email),
    department = VALUES(department),
    batch = VALUES(batch),
    instagram = VALUES(instagram),
    github = VALUES(github),
    linkedin = VALUES(linkedin);

INSERT INTO post (post_id, student_id, community_id, content, created_at) VALUES
('post_001', 'stu_001', 'com_001', 'Pushed a cleaner auth flow for our campus tooling. Need feedback on the retry states before demo day.', '2026-05-08 18:30:00'),
('post_002', 'stu_003', 'com_002', 'Shared three moodboards for the new resource library. The orange-teal route is winning so far.', '2026-05-09 10:15:00'),
('post_003', 'stu_004', 'com_003', 'Benchmark notebook is ready. Added dataset notes and a cleaner eval summary for the weekly review.', '2026-05-10 08:50:00'),
('post_004', 'stu_005', 'com_004', 'Uploaded a lightweight pitch skeleton for first-time founders. Happy to pair on edits.', '2026-05-10 20:05:00')
ON DUPLICATE KEY UPDATE
    student_id = VALUES(student_id),
    community_id = VALUES(community_id),
    content = VALUES(content),
    created_at = VALUES(created_at);

INSERT INTO resource (resource_id, student_id, community_id, title, file_url, created_at) VALUES
('res_001', 'stu_001', 'com_001', 'Node service boot checklist', 'https://example.com/resources/node-service-boot-checklist.pdf', '2026-05-07 14:20:00'),
('res_002', 'stu_003', 'com_002', 'Interface toneboard starter pack', 'https://example.com/resources/interface-toneboard.zip', '2026-05-08 11:00:00'),
('res_003', 'stu_004', 'com_003', 'Model evaluation worksheet', 'https://example.com/resources/model-eval-worksheet.xlsx', '2026-05-09 16:45:00'),
('res_004', 'stu_005', 'com_004', 'Pitch review scorecard', 'https://example.com/resources/pitch-review-scorecard.docx', '2026-05-10 12:10:00')
ON DUPLICATE KEY UPDATE
    student_id = VALUES(student_id),
    community_id = VALUES(community_id),
    title = VALUES(title),
    file_url = VALUES(file_url),
    created_at = VALUES(created_at);
