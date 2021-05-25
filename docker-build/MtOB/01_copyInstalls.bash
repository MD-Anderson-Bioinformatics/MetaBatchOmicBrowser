#!/bin/bash

echo "START 01_copyInstalls"

set -e

STD_DIR=$1

echo "compile MetaBatch Omic Browser"
cd ${STD_DIR}/apps/MetabatchOmicBrowser
mvn clean install dependency:copy-dependencies

echo "Copy MetaBatch Omic Browser WAR"
cp ${STD_DIR}/apps/MetabatchOmicBrowser/target/MetabatchOmicBrowser-*.war ${STD_DIR}/docker-build/MtOB/installations/MtOB.war

echo "List StdMW Installations"
ls -lh ${STD_DIR}/docker-build/MtOB/installations/

echo "FINISH 01_copyInstalls"

