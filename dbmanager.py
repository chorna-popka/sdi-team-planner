import os
from sqlalchemy import create_engine

# Global Variables
SQLITE = 'sqlite'

# Table Names
basedir = os.path.abspath(os.path.dirname(__file__))


class TeamDB:
    DB_ENGINE = {
        SQLITE: f'sqlite:///{basedir}/static/files/db.db'
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


