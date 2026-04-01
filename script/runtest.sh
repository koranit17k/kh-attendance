#!/bin/bash
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/view.sql
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/myview.sql
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/1.seed_test_data.sql
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/insert_attendance.sql
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/update_attendance.sql
mysql -u koranit -poeviivog payroll < /home/koranit/kh-attendance/sql/2.check_results.sql
