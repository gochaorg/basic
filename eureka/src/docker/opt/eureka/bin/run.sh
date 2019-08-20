#!/bin/bash
echo "start eureka mode=${EUREKA_MODE}"
/usr/local/openjdk-8/bin/java -jar /opt/eureka/jar/eureka-sample-0.0.1-SNAPSHOT.jar --spring.config.location=/etc/eureka/application-${EUREKA_MODE}.yml