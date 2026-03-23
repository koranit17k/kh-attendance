sudo mysql
USE payroll;
CREATE TABLE counter_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  count_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
หีก