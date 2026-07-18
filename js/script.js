// Today's Opening Hours

let openingText = document.getElementById("opening-hours");

if(openingText){

    let today = new Date().getDay();
    let message = "";

    switch(today){

        case 0:
            message = "Today's Opening Hours: 8:00 AM - 6:00 PM";
            break;

        case 6:
            message = "Today's Opening Hours: 8:00 AM - 8:00 PM";
            break;

        default:
            message = "Today's Opening Hours: 6:00 AM - 10:00 PM";
    }

    openingText.innerHTML = message;
}


// ===========================
// jQuery Filter Classes by Day
// ===========================

$(document).ready(function(){

    $("#dayFilter").change(function(){

        let selectedDay = $(this).val();

        if(selectedDay == "all"){

            $(".class-row").show();

        }

        else{

            $(".class-row").hide();

            $('.class-row[data-day="' + selectedDay + '"]').show();

        }

    });

});