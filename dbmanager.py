import os
from sqlalchemy import create_engine

# Global Variables
SQLITE = 'sqlite'
PG = 'postgres'
PGS = 'postgres'

# Table Names
basedir = os.path.abspath(os.path.dirname(__file__))


class TeamDB:
    DB_ENGINE = {
        PG: f'postgresql://localhost/team-planner',
        PGS: f'postgres://fndampqtimsbfe:3573c2aa7833dc8abbf904210057db5a5538045ace2568853c1d4a861e6ed311@ec2-63-34'
             f'-97-163.eu-west-1.compute.amazonaws.com:5432/dbpmqari93vh65 '
    }

    # Main DB Connection Ref Obj
    db_engine = None

    def __init__(self, dbtype, username='', password='', dbname=''):
        dbtype = dbtype.lower()
        if dbtype in self.DB_ENGINE.keys():
            engine_url = self.DB_ENGINE[dbtype].format(DB=dbname)
            self.db_engine = create_engine(engine_url)
        else:
            print("DBType is not found in DB_ENGINE")

    def execute_query(self, query=''):
        if query == '':
            return 'Nothing happened'
        with self.db_engine.connect() as connection:
            try:
                connection.execute(query)
                print(f"Query {query} Complete!")
            except Exception as e:
                return e

    def return_rows(self, query=''):
        rows = []
        if query == '':
            return 'Nothing happened'
        with self.db_engine.connect() as connection:
            try:
                result = connection.execute(query)
            except Exception as e:
                return e
            else:
                for row in result:
                    rows.append(row)
                result.close()
                return rows


