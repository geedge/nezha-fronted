#!/bin/bash

BUILD_MODE=$1

CUR_PATH=`pwd`
echo 'cur path is '${CUR_PATH}
DIST_PATH=$CUR_PATH/dist

echo 'dist dir path is '${DIST_PATH}

cp -f src/assets/img/log1-2.png $DIST_PATH/static

cd $DIST_PATH

if [[ 'all' == "${BUILD_MODE}" ]];then
	echo 'build all to zip file ,now moving map picture to static dir...'
	\cp -rf ../static/Tiles/ $DIST_PATH/static/
fi
echo 'start create zip...'

#find ./ * -exec touch -t $(date +%Y%m%d0000.00) {} \;

find ./ * -exec touch -t 202104301200.00 {} \;

zip -rX nz-gui.zip ./* >/dev/null

MD5=$(md5sum nz-gui.zip |awk '{print $1}'|cut -c 1-8)
mv nz-gui.zip nz-gui-${MD5}.zip

echo 'package zip file is complate ,please check in '${DIST_PATH}
