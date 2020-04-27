from flask import Blueprint, render_template , request ,redirect , flash, url_for , session , escape , Flask
from werkzeug.security import generate_password_hash , check_password_hash
from werkzeug.utils import secure_filename
from models.base_model import BaseModel
from models.booking import User, Booking
import datetime as dt

# from models import *
# from flask_login import login_user, logout_user, login_required
# from models import user as u
users_blueprint = Blueprint('users',
                            __name__,
                            template_folder='templates')


@users_blueprint.route('/', methods=['GET'])
def new():
    return render_template('/users/new.html')


@users_blueprint.route('/validate/<mobile_num>', methods=['POST'])
def validate(mobile_num):
    user_exist = User.get_or_create(User.mobile_num == mobile_num)

@users_blueprint.route('/book', methods=['POST'])    
def book():
    data = {}
    name = request.form['name']
    mobile = request.form['mobile']
    date_input = request.form['date']
    time = request.form['time']
    timestamp = date_input +  " " + time
    datetimeformat = dt.datetime.strptime(timestamp, '%d-%m-%Y %I:%M %p') 

    user = User.get_or_none(User.mobile_num == mobile)
    booking = Booking(booking_time = datetimeformat, user = user , slot =1 )
    booking.save()


    data['name'] = name
    data['mobile'] = mobile
    data['booking_time'] = datetimeformat

    return redirect(url_for('users.new'))