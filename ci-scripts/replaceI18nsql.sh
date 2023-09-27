#!/bin/bash
set -evx
CUR_PWD=`pwd`

echo 'add i18nData begin ... '

# 获取国际化数据
EN_RESULT=`mysql -h $NZ_DB_HOST -u$NZ_DB_USER -p$NZ_DB_PASSWORD -D $NZ_DB_NAME --default-character-set=utf8mb4 \
   -NBe "select CONCAT('{', REPLACE(REPLACE(GROUP_CONCAT(JSON_OBJECT( code,  value)),'{',''),'}',''), '}') from sys_i18n WHERE lang = 'en';"`

ZH_RESULT=`mysql -h $NZ_DB_HOST -u$NZ_DB_USER -p$NZ_DB_PASSWORD -D $NZ_DB_NAME --default-character-set=utf8mb4 \
   -NBe "select CONCAT('{', REPLACE(REPLACE(GROUP_CONCAT(JSON_OBJECT( code,  value)),'{',''),'}',''), '}') from sys_i18n WHERE lang = 'zh';"`


# 组装模板国际化数据
echo "const i18nData = { en:" > ../nezha-fronted/src/entrance/exportHtml/i18nData.js
echo -e  $EN_RESULT >> ../nezha-fronted/src/entrance/exportHtml/i18nData.js
echo ", zh:" >> ../nezha-fronted/src/entrance/exportHtml/i18nData.js
echo -e  $ZH_RESULT >> ../nezha-fronted/src/entrance/exportHtml/i18nData.js
echo "}" >> ../nezha-fronted/src/entrance/exportHtml/i18nData.js
echo "export default i18nData" >> ../nezha-fronted/src/entrance/exportHtml/i18nData.js

echo 'add i18nData finished'
