cd /www/wwwroot/tools/HoyoCloudGameHelper
sudo git fetch
sudo git reset --hard origin/main
cd configs
sudo git fetch
sudo git reset --hard origin/main
sudo cp ./global ../global.json
cd ..
sudo node src/index