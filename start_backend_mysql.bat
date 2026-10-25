@echo off
echo Starting CampusSphere Spring Boot Backend Server with MySQL Profile...
cd /d "%~dp0backend"
call "%~dp0tools\apache-maven-3.9.6\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=mysql
pause
