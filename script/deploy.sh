#!/bin/bash
set -e

KEY="/home/koranit/Downloads/instance2/ssh-key-2026-05-04.key"
USER="ubuntu"
HOST="161.118.204.74"
REMOTE_DIR="/var/www/kh-attendance"
APP_NAME="kh-attendance"
PORT="3000"

##อันนี้บัคต้อง pnpm build manual
# echo "Build local..."
# # timeout 300s: ถ้า build เสร็จแล้วค้าง จะ kill อัตโนมัติ (exit 124 = timeout = OK)
# # ถ้า build fail จริงๆ จะ exit ด้วย code อื่นและหยุด script
# timeout 60 pnpm build
# BUILD_EXIT=$?
# if [ $BUILD_EXIT -eq 124 ]; then
#   echo "Build completed (process killed after timeout — normal)"
# elif [ $BUILD_EXIT -ne 0 ]; then
#   echo "Build FAILED with exit code $BUILD_EXIT"
#   exit $BUILD_EXIT
# else
#   echo "Build completed cleanly (exit code: 0)"
# fi

echo "Prepare remote directory..."
chmod 600 "$KEY"
ssh -i "$KEY" $USER@$HOST "sudo mkdir -p $REMOTE_DIR && sudo chown -R $USER:$USER $REMOTE_DIR"

echo "Upload .output to Oracle..."
rsync -avz --delete \
  -e "ssh -i $KEY" \
  .output/ \
  $USER@$HOST:$REMOTE_DIR/.output/

echo "Upload package.json for dependencies..."
rsync -avz \
  -e "ssh -i $KEY" \
  package.json \
  $USER@$HOST:$REMOTE_DIR/

echo "Restart PM2..."
ssh -i "$KEY" $USER@$HOST "bash -lc '
  set -e
  export TZ=Asia/Bangkok

  echo \"Checking PM2...\"
  which node || true
  which pm2 || true

  pm2 delete $APP_NAME || true
  PORT=$PORT TZ=Asia/Bangkok pm2 start $REMOTE_DIR/.output/server/index.mjs \
    --name $APP_NAME \
    -- --port $PORT
  pm2 save
  pm2 list
'"

echo "Configure Nginx..."
ssh -i "$KEY" $USER@$HOST "sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null" << EOF
server {
    listen 80;
    server_name $HOST;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ssh -i "$KEY" $USER@$HOST "
  sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
  sudo nginx -t && sudo systemctl restart nginx
"

echo "Deploy Jasper Reports..."
ssh -i "$KEY" $USER@$HOST "bash -lc '
  set -e

  echo \"Preparing report directory...\"
  sudo mkdir -p /home/ubuntu/kxreport/report/payroll
  cp ~/kxreport/report/src/*.jrxml /home/ubuntu/kxreport/report/payroll 2>/dev/null || true

  echo \"Building Jasper reports...\"
  cd ~/kxreport
  ./script/build.sh

  echo \"Deploying .jasper files...\"
  cd ~/kxreport/target/jasper/payroll
  sudo mkdir -p /khgroup/report/payroll
  sudo cp *.jasper /khgroup/report/payroll/
  sudo chmod 644 /khgroup/report/payroll/*.jasper
  sudo chmod 755 /khgroup/report /khgroup/report/payroll

  echo \"Restarting Tomcat...\"
  sudo systemctl restart tomcat10
'"

echo "Deploy completed!"