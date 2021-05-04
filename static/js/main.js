function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    var ISOweekEnd = ISOweekStart;
    return ISOweekStart.toISOString().split('T')[0];
}

function deleteRecord() {
    if ($('#editCellWhat').val() == "V") {
        fetch('/delete/vacation',
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "guy": $('#editCellGuy').val(),
                "vacation": $('#editCellProject').val()
            })
        }).then(function (response) {
        return response.text();
        }).then(function (text) {
           $('#editCell').modal('hide');
           document.location.reload(true);
        });
    } else if ($('#editCellWhat').val() == "P"){
        fetch('/delete/project',
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "guy": $('#editCellGuy').val(),
                "project": $('#editCellProject').val()
            })
        }).then(function (response) {
        return response.text();
        }).then(function (text) {
            $('#editCell').modal('hide');
            document.location.reload(true);
        });
    }
}

!(function($) {
    "use strict";
    const YEAR = 2021;
    $('[data-toggle="tooltip"]').tooltip();

    $('#editCellChoice').on("change", function() {

    });
//projects
    $("a[data-project]").each(function(index) {
        $(this).on("click", function(event){
            event.preventDefault();
            $('#projectCardLabel').html("Edit <span class='project-window' id='projectCardTitle' contenteditable>" + $(this).data("title") + "</span>");
            $('#projectCardId').val($(this).data("project"));
            $('#projectCardCountry').val($(this).data("country"));
            $('#projectCardStart').val($(this).data("start").slice(0,10));
            $('#projectCardEnd').val($(this).data("end").slice(0,10));
            $('#projectCard').modal('show');
        });
    });
    $("#projectAddButton").on("click", function(event){
        event.preventDefault();
        $('#projectCardLabel').html("Add <span class='project-window' id='projectCardTitle' contenteditable>New Project</span>");
        $('#projectCardId').val("0");
        $('#projectCardCountry').val("");
        $('#projectCardStart').val("");
        $('#projectCardEnd').val("");
        $('#projectCard').modal('show');
    });


//cells
    $("div[data-week]").each(function(index) {
        $(this).on("click", function(){
            var guy = $(this).data('guy');
            if ($(this).hasClass('vacationcell')) {
                var vacationId = $(this).data('project');
                $('#editCellLabel').html("Edit vacation");
                //fetch vacation
                fetch('/get/vacation',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        "guy": guy,
                        "vacation": vacationId
                    })
                }).then(function (response) {
                return response.json();
                }).then(function (text) {
                    //here we process the returned array
                    $('#editCellGuy').val(guy);
                    $('#editCellWhat').val("V");
                    $('#editCellProject').val(vacationId);
                    $('#editCellChoice').hide();
                    $('#editCellType').show();
                    $('#editCellType').html("Vacation");
                    $('#editCellStart').val(text[0].start);
                    $('#editCellEnd').val(text[0].end);
                    $('#editCell').modal('show');
                });
            } else if ($(this).hasClass('emptycell')) {
                $('#editCellLabel').html("Add plan");

                var week = $(this).data('week');
                var start = getDateOfISOWeek(parseInt(week), YEAR);
                $('#editCellGuy').val(guy);
                $('#editCellWhat').val("E");
                $('#editCellStart').val(start);
                $('#editCellEnd').val("");
                $('#editCellType').hide();
                $('#editCellChoice').show();
                $('#editCell').modal('show');

            } else {
                var projectId = $(this).data('project');
                var projectName = $(this).data('original-title');
                $('#editCellLabel').html("Edit assignment");
                //fetch project
                fetch('/get/project',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        "guy": guy,
                        "project": projectId
                    })
                }).then(function (response) {
                return response.json();
                }).then(function (text) {
                    //here we process the returned array
                    $('#editCellGuy').val(guy);
                    $('#editCellWhat').val("P");
                    $('#editCellProject').val(projectId);
                    $('#editCellChoice').hide();
                    $('#editCellType').show();
                    $('#editCellType').html(projectName);
                    $('#editCellStart').val(text[0].start);
                    $('#editCellEnd').val(text[0].end);
                    $('#editCell').modal('show');
                });
            }
        });
    });
//save in modal
    $("#editCellSave").on("click", function() {
        //check delete flag, if yes - call delete function
        if ($("#editCellDeleteFlag").val() == "1") {
            deleteRecord();
            return;
        }
        if ($('#editCellWhat').val() == "V") {
            fetch('/save/vacation',
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "guy": $('#editCellGuy').val(),
                    "vacation": $('#editCellProject').val(),
                    "start": $('#editCellStart').val(),
                    "end": $('#editCellEnd').val()
                })
            }).then(function (response) {
            return response.text();
            }).then(function (text) {
               $('#editCell').modal('hide');
               document.location.reload(true);
            });
        } else if ($('#editCellWhat').val() == "P"){
            fetch('/save/assignment',
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "guy": $('#editCellGuy').val(),
                    "project": $('#editCellProject').val(),
                    "start": $('#editCellStart').val(),
                    "end": $('#editCellEnd').val()
                })
            }).then(function (response) {
            return response.text();
            }).then(function (text) {
                $('#editCell').modal('hide');
                document.location.reload(true);
            });
        } else if ($('#editCellWhat').val() == "E"){
            fetch('/add',
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "guy": $('#editCellGuy').val(),
                    "project": $('#editCellChoice').val(),
                    "start": $('#editCellStart').val(),
                    "end": $('#editCellEnd').val()
                })
            }).then(function (response) {
            return response.text();
            }).then(function (text) {
                $('#editCell').modal('hide');
                document.location.reload(true);
            });
        }
    });

    $("#projectCardSave").on("click", function() {
        if ($('#projectCardTitle').html() == "" ||
            $('#projectCardTitle').html() == "New Project" ||
            $('#projectCardCountry').val() == "" ||
            $('#projectCardStart').val() == "" ||
            $('#projectCardEnd').val() == "") {
            return;
        }
        var active = 1;
        if (!$('#projectCardActive').prop("checked")) {
            active = 0;
        }
        fetch('/save/project',
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify({
                    "project": $('#projectCardId').val(),
                    "title": $('#projectCardTitle').html(),
                    "country": $('#projectCardCountry').val(),
                    "start": $('#projectCardStart').val(),
                    "end": $('#projectCardEnd').val(),
                    "active":  active
                })
            }).then(function (response) {
            return response.text();
            }).then(function (text) {
                $('#projectCard').modal('hide');
                document.location.reload(true);
            });

    });
//delete activator
    $("#editCellDelete").on("click", function() {
    // toggles delete flag if modal type is not empty
        if ($('#editCellWhat').val() == "E") {
            return;
        }
        if ($("#editCellDeleteFlag").val() == "1") {
            $("#editCellDeleteFlag").val("0");
            $('#editCellStart').prop("disabled", false);
            $('#editCellEnd').prop("disabled", false);
        } else {
            $("#editCellDeleteFlag").val("1");
            $('#editCellStart').prop("disabled", true);
            $('#editCellEnd').prop("disabled", true);
        }

    });

})(jQuery);