submitBtn  = document.getElementById('user_detail')
bookingForm = document.getElementById('date-select')
bookBtn = document.getElementById('submit_book')
validationText = document.getElementsByClassName('validation')
timeSlot = document.getElementById('time-slot')
timeSelect = document.getElementById('time-select')
var userBooking = []

function getHoursBooking(dateSelected){
    dateCompareStart = moment(dateSelected+' 09:00 AM','DD-MM-YYYY hh:mm a').format()
    dateCompareEnd = moment(dateSelected+' 06:00 PM','DD-MM-YYYY hh:mm a').format()
    filteredDate = userBooking.filter(date => {
                                    date = moment(date, 'DD-MM-YYYY hh:mm a').format();
                                    return date >= dateCompareStart && date <= dateCompareEnd
                                    })
    hoursBooked = Array.from(new Set(filteredDate.map(item => moment(item,'DD-MM-YYYY hh:mm a').hours())))
    return hoursBooked
}


function submitDate(dateSelected){
// Get Time Slot from server here
 var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState == 4)
        {
            if (xhttp.status == 200){
                
                slotAvailable = (JSON.parse(this.responseText)).timeslot
                
                timeSlot.innerHTML = ""
                $('#time-select').removeClass('displayNone')
                $('#time-select').addClass('displayBlock')
                $('.progress').removeClass('displayBlock')
                $('.progress').addClass('displayNone')
                bookBtn.style.display='block';
            
                
                userhoursBooked = getHoursBooking(dateSelected)

                slotAvailable.forEach(function(elem){
                    // Populate the Option Selection with Condition
                    option = document.createElement("option")
                    option.value = elem.time
                    
                    hour = moment(elem.time , 'hh:mm a').hours()
                    if(userhoursBooked.includes(hour)){
                        option.innerHTML=elem.time + " (You Have booked this slot)"
                        option.disabled = true
                    }else if (elem.slot_available > 0) {
                       option.innerHTML = elem.time + '  '+ `(${elem.slot_available} slot left )` 
                    }else if(elem.slot_available==0){
                       option.innerHTML = elem.time + ' (Slot Full)';
                       option.disabled = true
                    }
                    // bookedHour = filteredDate.filter(date => {
                    //         time = moment(date).format('%H') 
                    // })
                    timeSlot.appendChild(option);
                });
                $('select').formSelect();
            }
        }
    }
    xhttp.open("POST",'http://localhost:5000/api/v1/users/timeslot',true)
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    $('#time-select').removeClass('displayBlock')
    $('#time-select').addClass('displayNone')
    $('.progress').removeClass('displayNone')
    $(".progress").addClass('displayBlock')

    var postVars = 'dateSend='+dateSelected;
    // xhttp.send(null);
    
    xhttp.send(postVars);

}

function submitUser(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState == 4)
        {
            if (xhttp.status == 200){
                userBooking =  JSON.parse(this.responseText).bookings
                // Push user Bookings into array here for comparision latear.

                bookingForm.style.display = 'block';
                // validationText[0].innerHTML = 'Contact Details Validated';
                // validationText[0].style.display = 'block'; 
                M.toast({html: 'Contacts Validated', classes:'toast-success'})
                submitBtn.style.display='none';
            }
        }


    }
    xhttp.open("POST",'http://localhost:5000/api/v1/users/validate',true)
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    var postVars = 'mobile='+mobile+'&name='+name
    xhttp.send(postVars);

}
function validateForm(e){
    e.preventDefault()
    phoneReg = /^01/g
    name  = document.user_form.name.value
    mobile = document.user_form.tel.value
    inputs = document.user_form.getElementsByTagName('input')
    console.log(mobile.length)
    errorMsg = []
    if (name == "" || name == null) {
        errorMsg.push('Name Field cannot be empty')
    }
    
    if (mobile == "" || mobile == null) {
        errorMsg.push('Telephone Number Field cannot be empty')
    }else if (phoneReg.test(mobile) == false || mobile.length != 10) {
        errorMsg.push('Mobile phone number format wrong, Ex: 0127898903')
    }
    
    if (errorMsg.length>0){
        errorMsg.forEach( msg => M.toast({html: msg, classes:'toast-error'}))

    }else if (errorMsg.length==0){
        // console.log(bookingForm)
        bookingForm.style.display='block'
        inputs[0].disabled = true;
        inputs[1].disabled = true;

        submitUser();
    } 
} 
function bookSlot(){
    // e.preventDefault();
    name =  document.user_form.name.value,
    mobile = document.user_form.tel.value
    time  = document.user_form.time.value
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(xhttp.readyState == 4){
            if (xhttp.status == 200){
                // console.log(this.responseText)
                submitUser();
                submitDate(serverDate);
                M.toast({html: 'Succesfully Book the slot'})
                M.toast({html: 'You can Book Another Slot Again..'})
            }else if(xhttp.status = 422){
                console.log(this.responseText)
                submitDate(serverDate);
                M.toast({html: 'Someone had booked the slot'})
            }else{
                M.Toast({html: 'Oops, Something wrong with the Server , please try again.'})
            }
        }

    }
    xhttp.open("POST",'http://localhost:5000/api/v1/users/book',true)
    xhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    var postVars = 'name='+name+'&mobile=' + mobile  + '&date=' + serverDate + '&time=' + time  
    xhttp.send(postVars);


}
var serverDate
today = new Date()
submitBtn.addEventListener('click', validateForm)
bookBtn.addEventListener('click', e => {e.preventDefault(); bookSlot()})

$(document).ready(function(){
    $('.datepickerM').datepicker({
        minDate: new Date(today.setDate(today.getDate() + (3 * 7))),
        defaultDate: new Date(today),
        disableDayFn: function(date){
            if(date.getDay() == 0){
                return true
            }
            else{return false}
        },
        onSelect: function(date){
           serverDate = (moment(date).format('DD-MM-YYYY'));
        //    submitDate(serverDate);
        },
    });
    
});
$('.datepickerM').change(() => submitDate(serverDate))

// console.log($date)