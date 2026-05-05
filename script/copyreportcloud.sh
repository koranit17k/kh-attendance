ssh -i /home/koranit/Downloads/instance2/ssh-key-2026-05-04.key ubuntu@161.118.204.74
sudo mkdir -p /home/ubuntu/kxreport/report/payroll
cp *.jrxml /home/ubuntu/kxreport/report/payroll

./script/build.sh

cd ~/kxreport/target/jasper/payroll
sudo mkdir -p /khgroup/report/payroll
sudo cp *.jasper /khgroup/report/payroll/
sudo chmod 644 /khgroup/report/payroll/*.jasper
sudo chmod 755 /khgroup/report /khgroup/report/payroll
sudo systemctl restart tomcat10