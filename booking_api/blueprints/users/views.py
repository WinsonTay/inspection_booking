from flask import Blueprint, jsonify ,request,make_response , redirect , render_template , flash
import datetime as dt
from datetime import timedelta , time , date
import json
import time as ti

from models.base_model import BaseModel
from models.booking import User, Booking
users_api_blueprint = Blueprint('users_api',
                             __name__,
                             template_folder='templates')

@users_api_blueprint.route('/validate', methods=['POST'])
def validate():
    # req = request.get_json()
    # print(req)
    data = {}
    name = request.form['name']
    mobile = request.form['mobile']
    user_exist = User.get_or_none(User.mobile_num == mobile)
    
    if user_exist == None:
        new_user = User(name=name , mobile_num = mobile)
        new_user.save()
        data['user_id'] = new_user.id
        data['mobile']  = new_user.mobile_num
        data['bookings'] = []
    else:
        data['user_id'] = user_exist.id
        data['mobile'] = user_exist.mobile_num
        data['bookings'] = [booking.booking_time.strftime('%d-%m-%Y %I:%M %p')  for booking in user_exist.bookings.order_by(Booking.booking_time)]

    res = make_response(jsonify(data),200)
    return res

@users_api_blueprint.route('/timeslot', methods=['POST'])
def timeslot():
    data = {}
    dateinput = request.form['dateSend']
    start_time = dt.datetime.combine(dt.datetime.strptime(dateinput,'%d-%m-%Y'), time(9,0))
    bookedslot = Booking.select().where((Booking.booking_time >= start_time) &
                                        (Booking.booking_time <= start_time+timedelta(hours=10))
                                        ).order_by(Booking.booking_time)
    booking_list = [value.booking_time for value in bookedslot]
    data['timeslot'] = [{'time': (start_time+timedelta(minutes=i*30)).strftime('%I:%M %p') , 
                         'slot_available':check_slot_available(start_time+timedelta(minutes=i*30),booking_list)} for i in range (0,19) ] 
    data['date'] = dateinput
    ti.sleep(0.1);
    return make_response(jsonify(data),200)

    
@users_api_blueprint.route('/book', methods=['POST'])
def book():
    data = {}
    name = request.form['name']
    mobile = request.form['mobile']
    date_input = request.form['date']
    time = request.form['time']
    timestamp = date_input +  " " + time
    datetimeformat = dt.datetime.strptime(timestamp, '%d-%m-%Y %I:%M %p') 

    user = User.get_or_none(User.mobile_num == mobile)
    bookSlotValidate = Booking.select().where(Booking.booking_time == datetimeformat)
    if len(bookSlotValidate) > 0:
        slot_booked = check_slot_available(datetimeformat,[slot.booking_time for slot in bookSlotValidate])
        if slot_booked == 0:
            res = make_response(jsonify('Slot was Booked by Other user'),422)
            return res
        
    booking = Booking(booking_time = datetimeformat, user = user , slot =1 )
    booking.save()
       
    data['name'] = name
    data['mobile'] = mobile
    data['booking_time'] = datetimeformat
    # return redirect('users/new.html')
    res = make_response(jsonify(data),200)
    return res


def check_slot_available(time,booklist):
    max_slot = 2
    if time.weekday() == 5:
        max_slot = 4
    
    count = booklist.count(time)
    return max_slot - count 