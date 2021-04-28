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
    $('[data-toggle="tooltip"]').tooltip();

    $("div[data-week]").each(function(index) {
    $(this).on("click", function(){
        var guy =  $(this).data('id');
        var vacation = false;
        if ($(this).hasClass('vacationcell')) {
            $('#editCellType').html("Vacation");
            vacation = true;
            var vacationId = $(this).data('project');
            //fetch vacation
        } else if ($(this).hasClass('emptycell')) {
            //do nothing
            $('#editCellType').html("Add plan");
            var week = $(this).data('week');
            var start = getDateOfISOWeek(parseInt(week), 2021);
            $('#editCellStart').val(start);
        } else {
            var projectId = $(this).data('project');
            $('#editCellType').html($(this).data('original-title'));
            //fetch project
        }
        
        $('#editCell').modal('show');
    });
});

    $('#editCedll').on('show.bs.modal', function (event) {
        var cell = $(event.relatedTarget) // Button that triggered the modal
        var mate = cell.data('id') // Extract info from data-* attributes
        var full_name = cell.data('person')
        var modal = $(this)
        fetch('/get/' + mate,
        {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "id": mate
            })
        }).then(function (response) {
        return response.json();
        }).then(function (text) {
        //here we process the returned array
          modal.find('.modal-title').text('Manage ' + full_name);
      });


     //   modal.find('.modal-body input').val(mate)
    })

})(jQuery);