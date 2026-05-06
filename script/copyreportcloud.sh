#!/bin/bash
KEY="/home/koranit/Downloads/instance2/ssh-key-2026-05-04.key"
USER="ubuntu"
HOST="161.118.204.74"

ssh -i "$KEY" $USER@$HOST "sudo mkdir -p /khgroup/report/payroll && sudo chown -R $USER:$USER /khgroup/report/payroll"

rsync -avz --delete \
  -e "ssh -i $KEY" \
  report/*.jasper \
  $USER@$HOST:/khgroup/report/payroll/

ssh -i "$KEY" $USER@$HOST "
  sudo chmod 644 /khgroup/report/payroll/*.jasper
  sudo systemctl restart tomcat10
"