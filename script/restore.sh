#!/bin/bash
unzip /home/koranit/Downloads/payroll.zip 
sudo mysql payroll < payroll.sql
rm payroll.sql
sudo mysql payroll < /home/koranit/kh-attendance/sql/view.sql
sudo mysql payroll < /home/koranit/kh-attendance/sql/myview.sql

