from flask import Flask, render_template, request, url_for, jsonify
from dbmanager import TeamDB, PGS
import datetime as dt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ojwononceim8378478(&HD&&$Hhhdfj##dd'
uname = 'postgres'
pwd = 'qweewq13P'
uname_h = 'fndampqtimsbfe'
pwd_h = '3573c2aa7833dc8abbf904210057db5a5538045ace2568853c1d4a861e6ed311'
dbname = 'team-planner'
dbname_h = 'dbpmqari93vh65'
db = TeamDB(dbtype=PGS, username=uname_h, password=pwd_h, dbname=dbname_h)


def create_plans(plans):
    # plans = [{"type": "V"} if plan[0] == 'Vacation' else {"type": "P", "name": plan[0]} for plan in plans]
    plns = {}
    for plan in plans:
        if plan[0] == 'Vacation':
            val = {"type": "V", "id": plan[3]}
        else:
            val = {"type": "P", "project": plan[0], "id": plan[3]}

        begin = dt.datetime.fromisoformat(plan[1]).isocalendar()[1]
        end = dt.datetime.fromisoformat(plan[2]).isocalendar()[1]
        if begin == 53 and begin > end:
            begin = 1

        for w in range(begin, end + 1):
            if w in plns:  # adding another plan for the same week, vacation always on top
                if val['type'] == 'V':
                    plns[w].insert(0, val)
                else:
                    plns[w].append(val)
            else:
                plns[w] = [val]
    return plns


# all Flask routes below
@app.route("/")
def home():
    thisweek = dt.datetime.now().isocalendar()[1]
    query = """select tm.id as id, CONCAT(tm.name, ' ', tm.last_name) as name
                from team_members as tm"""
    dataset = db.return_rows(query)
    guys = [{"id": n[0], "name": n[1], "plan": {}} for n in dataset]
    for guy in guys:
        query = f"select 'Vacation', v.start, v.end, v.id " \
                f"from vacations v " \
                f"where v.team_member = {guy['id']} " \
                f"UNION " \
                f"select p.title, a.start, a.end, p.id " \
                f"from assignments a " \
                f"left join projects p on p.id = a.project " \
                f"where a.team_member = {guy['id']} "
        plans = create_plans(db.return_rows(query))
        guy["plan"] = plans

    query = """SELECT * from projects WHERE active = 1 ORDER BY title"""
    projects = db.return_rows(query)

    return render_template("index.html", guys=guys, thisweek=thisweek, projects=projects)


@app.route("/save/<what>", methods=["POST"])
def save(what):
    if request.method == "POST":
        if what == "vacation":
            query = f"UPDATE vacations " \
                    f"SET start = '{request.get_json()['start']} 00:00:00.000', " \
                    f"end = '{request.get_json()['end']} 00:00:00.000' " \
                    f"WHERE id = {int(request.get_json()['vacation'])} " \
                    f"and team_member = {int(request.get_json()['guy'])}"
        elif what == "assignment":
            query = f"UPDATE assignments " \
                    f"SET start = '{request.get_json()['start']} 00:00:00.000', " \
                    f"end = '{request.get_json()['end']} 00:00:00.000' " \
                    f"WHERE project = {int(request.get_json()['project'])} " \
                    f"and team_member = {int(request.get_json()['guy'])}"
        elif what == "project":
            if request.get_json()['project'] == "0":
                # new project
                query = f"INSERT INTO projects (title, country, 'start', 'end', active) " \
                        f"VALUES (" \
                        f"'{request.get_json()['title']}', " \
                        f"'{request.get_json()['country']}', " \
                        f"'{request.get_json()['start']} 00:00:00.000', " \
                        f"'{request.get_json()['end']} 00:00:00.000', " \
                        f"{int(request.get_json()['active'])}" \
                        f") "
            else:
                query = f"UPDATE projects " \
                        f"SET 'start' = '{request.get_json()['start']} 00:00:00.000', " \
                        f"end = '{request.get_json()['end']} 00:00:00.000', " \
                        f"title = '{request.get_json()['title']}', " \
                        f"country = '{request.get_json()['country']}', " \
                        f"active = {int(request.get_json()['active'])} " \
                        f"WHERE id = {int(request.get_json()['project'])} "

        query = query.replace('end', '"end"')
        db.execute_query(query)
    return 'OK', 200


@app.route("/delete/<what>", methods=["POST"])
def delete(what):
    if request.method == "POST":
        if what == "vacation":
            query = f"DELETE from vacations " \
                    f"WHERE id = {int(request.get_json()['vacation'])} " \
                    f"and team_member = {int(request.get_json()['guy'])}"
        elif what == "project":
            query = f"DELETE from assignments " \
                    f"WHERE project = {int(request.get_json()['project'])} " \
                    f"and team_member = {int(request.get_json()['guy'])}"

        db.execute_query(query)
    return 'OK', 200


@app.route("/add", methods=["POST"])
def add():
    if request.method == "POST":
        what = request.get_json()['project']
        if what == "v":
            query = f"INSERT into vacations " \
                    f"(team_member, start, end) " \
                    f"VALUES (" \
                    f"{int(request.get_json()['guy'])}, " \
                    f"'{request.get_json()['start']} 00:00:00.000', " \
                    f"'{request.get_json()['end']} 00:00:00.000')"
        else:
            query = f"INSERT into assignments " \
                    f"(team_member, project, start, end) " \
                    f"VALUES (" \
                    f"{int(request.get_json()['guy'])}, " \
                    f"{int(request.get_json()['project'])}, " \
                    f"'{request.get_json()['start']} 00:00:00.000', " \
                    f"'{request.get_json()['end']} 00:00:00.000')"

        query = query.replace('end', '"end"')
        db.execute_query(query)
    return 'OK', 200


@app.route("/get/<what>", methods=["POST"])
def get(what):
    if request.method == "POST":
        if what == "vacation":
            query = f"select v.start, v.end " \
                    f"from vacations v " \
                    f"where v.team_member = {int(request.get_json()['guy'])} " \
                    f"and v.id = {int(request.get_json()['vacation'])} "
        elif what == "project":
            query = f"select a.start, a.end " \
                    f"from assignments a " \
                    f"left join projects p on p.id = a.project " \
                    f"where a.team_member = {int(request.get_json()['guy'])} " \
                    f"and p.id = {int(request.get_json()['project'])} "

        dataset = [{
            "start": dt.datetime.fromisoformat(item[0]).strftime("%Y-%m-%d"),
            "end": dt.datetime.fromisoformat(item[1]).strftime("%Y-%m-%d")
        } for item in db.return_rows(query)]

        return jsonify(dataset)


if __name__ == '__main__':
    app.run(debug=True)
