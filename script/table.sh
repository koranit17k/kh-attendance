sudo mysql
USE payroll;
CREATE TABLE `counter` (
  `value` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
);