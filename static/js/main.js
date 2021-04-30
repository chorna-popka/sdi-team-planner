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

!(function($) {
    "use strict";
    const YEAR = 2021;
    $('[data-toggle="tooltip"]').tooltip();

    $('#editCellChoice').on("change", function() {

    });

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
                });
            }

            $('#editCell').modal('show');
        });
    });

    $("#editCellSave").on("click", function() {
        //send data to flask
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
            fetch('/save/project',
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
})(jQuery);