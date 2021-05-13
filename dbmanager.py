import os
from sqlalchemy import create_engine

# Global Variables
SQLITE = 'sqlite'
PGS = 'postgres'

# Table Names
# os.environ['DATABASE_URL'] = 'postgres://fndampqtimsbfe:3573c2aa7833dc8abbf904210057db5a5538045ace2568853c1d4a861e6ed311@ec2-63-34-97-163.eu-west-1.compute.amazonaws.com:5432/dbpmqari93vh65'
database_path = os.getenv('DATABASE_URL', 'postgresql://localhost/team-planner')
if database_path.startswith("postgres://"):
    database_path = database_path.replace("postgres://", "postgresql://", 1)


class TeamDB:
    DB_ENGINE = {
        PGS: database_path,
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
            except Exception as e:
                print(f"Query error {e}!")
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


