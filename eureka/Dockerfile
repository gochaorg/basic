FROM openjdk:8u222-jdk-stretch
MAINTAINER gochaorg "nt.gocha@gmail.com"
ARG mode
RUN mkdir -p /opt/eureka
RUN mkdir -p /opt/eureka/bin
RUN mkdir -p /opt/eureka/jar
RUN mkdir -p /etc/eureka
COPY target/eureka-sample-0.0.1-SNAPSHOT.jar /opt/eureka/jar/eureka-sample-0.0.1-SNAPSHOT.jar
COPY run/application-single.properties /etc/eureka/application-single.properties
#COPY run/application-1.yml  /opt/eureka/application-1.yml
#COPY run/application-2.yml  /opt/eureka/application-2.yml
COPY src/docker/etc/eureka/application-1d.yml  /etc/eureka/application-1.yml
COPY src/docker/etc/eureka/application-2d.yml  /etc/eureka/application-2.yml
WORKDIR /opt/eureka/jar
EXPOSE 8761
EXPOSE 8701
EXPOSE 8702
# ENTRYPOINT [ "/usr/local/openjdk-8/bin/java", "-jar", "eureka-sample-0.0.1-SNAPSHOT.jar", "--spring.config.location=/etc/eureka/application.yml" ]
ENV EUREKA_MODE=${mode}
COPY src/docker/opt/eureka/bin/run.sh /opt/eureka/bin/run.sh
RUN chmod a+x /opt/eureka/bin/run.sh
ENTRYPOINT [ "/bin/bash", "/opt/eureka/bin/run.sh" ]