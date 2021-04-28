from flask import Flask, render_template, request, url_for, jsonify
from werkzeug.utils import redirect
from dbmanager import TeamDB, SQLITE
import datetime as dt

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ojwononceim8378478(&HD&&$Hhhdfj##dd'


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
            if w in plns:  # adding another plan for the same week
                plns[w].append(val)
            else:
                plns[w] = [val]
    return plns


# all Flask routes below
@app.route("/")
def home():
    thisweek = dt.datetime.now().isocalendar()[1]
    # mock dict to be replaced with database query
    db = TeamDB(dbtype=SQLITE, dbname='team.sqlite')
    query = """select tm.id, tm.name || ' ' || tm.last_name name
                from team_members tm"""
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

    return render_template("index.html", guys=guys, thisweek=thisweek)


@app.route("/edit/<mate>")
def edit(mate):
    return render_template("index.html")


@app.route("/get/<mate>", methods=["POST"])
def get(mate):
    if request.method == "POST":
        db = TeamDB(dbtype=SQLITE, dbname='team.sqlite')
        query = f"select 'Vacation', v.start, v.end " \
                f"from vacations v " \
                f"where v.team_member = {int(mate)} " \
                f"UNION " \
                f"select p.title, a.start, a.end " \
                f"from assignments a " \
                f"left join projects p on p.id = a.project " \
                f"where a.team_member = {int(mate)} " \
                f"ORDER BY start"
        dataset = [{
            "title": item[0],
            "start": dt.datetime.fromisoformat(item[1]).strftime("%Y-%m-%d"),
            "end": dt.datetime.fromisoformat(item[2]).strftime("%Y-%m-%d")
        } for item in db.return_rows(query)]

        return jsonify(dataset)



if __name__ == '__main__':
    app.run(debug=True)
