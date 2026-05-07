ALTER EVENT transferAttendance
ON SCHEDULE EVERY 1 DAY
STARTS '2026-02-23 09:55:00.000'
ON COMPLETION PRESERVE
ENABLE
DO begin declare v_date DATE;

set
    v_date = curdate() - interval 2 DAY;

call runTimeCard (v_date);

call runAttendance (v_date);
end;
