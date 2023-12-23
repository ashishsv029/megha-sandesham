FROM postgres:10.10
#once the postgresql server is staretd/running, it executes the sql files present in initdb.d folder, so copying our db scripts here
COPY db-scripts/ /docker-entrypoint-initdb.d/

